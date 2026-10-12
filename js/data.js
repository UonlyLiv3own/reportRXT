(function (g) {
  const groups = [
    "Bồi thường lần đầu",
    "Bồi thường bổ sung, NVTC",
    "Thưởng bàn giao mặt bằng",
    "Tạm cư",
  ];
  const norm = (x) =>
    String(x ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/đ/g, "d")
      .replace(/\s+/g, " ")
      .trim();
  // Chỉ các trường tiền được xử lý như số; reason/proposal luôn là chữ.
  const isMoneyField = k => /^(budget|paid|remaining|refund|bank|openPaid|openRefund|weekly)/.test(k);
  function formatDate(v) {
    if (v == null || v === "") return "";
    if (v instanceof Date) return `${v.getDate()}/${v.getMonth()+1}/${v.getFullYear()}`;
    if (typeof v === "number" && g.XLSX) { const d = XLSX.SSF.parse_date_code(v); return d ? `${d.d}/${d.m}/${d.y}` : String(v); }
    if (/^\d{4}-\d{2}-\d{2}/.test(String(v))) return String(v).slice(0,10).split("-").reverse().join("/");
    return String(v);
  }
  function mapping(rows) {
    const top = rows.findIndex(
      (r) =>
        r.some((c) => norm(c) === "cb thu ly") &&
        r.some((c) => norm(c) === "ho ten"),
    );
    if (top < 0) throw Error("Không tìm thấy tiêu đề sheet dữ liệu chính.");
    let upper = rows[top],
      lower = rows[top + 1] || [],
      section = "";
    const cols = {};
    const cumulative = upper.some(c => norm(c) === "luy ke da chi");
    for (let i = 0; i < Math.max(upper.length, lower.length); i++) {
      const a = norm(upper[i]),
        b = norm(lower[i]);
      if (/^da chi(?:\s|$)/.test(a)) section = "da chi";
      else if (["du toan", "chi trong tuan", "luy ke da chi", "chua chi", "ly do chua chi"].includes(a)) section = a;
      else if (["ton gui ngan hang", "de xuat", "ghi chu"].includes(a)) section = "";
      const m = RXT_MAPPING.find((m) =>
        m.group
          ? norm(m.group) === section &&
            norm(m.header) === b &&
            !["budgetTotal", "remainingTotal"].includes(m.field)
          : norm(m.header) === a || norm(m.header) === b,
      );
      if (m) cols[m.field] = i;
      if (section === "du toan" && b === "du toan") cols.budgetTotal = i;
    }
    // File cũ chưa có lũy kế: đã chi là số nguồn hiện có.
    if (!cumulative) {
      for (let n = 0; n < 4; n++) cols["paid" + n] = cols["openPaid" + n];
      cols.refund = cols.openRefund;
    }
    const newFields = ["resettlement", "handoverDate", "proposal", ...[0,1,2,3].flatMap(n => ["openPaid"+n,"weekly"+n,"reason"+n]), "openRefund", "weeklyRefund"];
    if (cumulative) for (const k of newFields) if (cols[k] === undefined) throw Error("Thiếu cột trong cấu trúc mới: " + k);
    const need = [
      "stt",
      "name",
      "plan",
      "address",
      "officer",
      "decisionBudget",
      "decisionPlan",
      "decisionExtra",
      "decisionHousing",
      "planExtra",
      "planOld",
      "ward",
      ...["budget", "paid", "remaining"].flatMap((k) =>
        [0, 1, 2, 3].map((n) => k + n),
      ),
      "refund",
      "bank",
      "budgetTotal",
    ];
    for (const k of need)
      if (cols[k] === undefined)
        throw Error(
          "Không nhận diện được cột " +
            k +
            ". Hãy giữ tiêu đề Excel theo bảng mapping.",
        );
    const rt = cols.remaining3 + 1;
    if (!upper[rt] && !lower[rt] && rt < cols.bank) cols.remainingTotal = rt;
    const noteCol = upper.findIndex(c => norm(c) === "ghi chu");
    if (noteCol >= 0) cols.note = noteCol;
    return { cols, start: top + 4, cumulative };
  }
  function parse(raw) {
    const { cols, start, cumulative } = mapping(raw.rows);
    let issues = [];
    const records = raw.rows
      .slice(start)
      .map((r, i) => {
        if (
          !String(r[cols.name] ?? "").trim() ||
          !Number.isFinite(Number(r[cols.stt])) ||
          r[cols.stt] == null
        )
          return null;
        const h = { id: String(start + i + 1), sourceRow: start + i + 1 };
        const inputAlerts = [];
        for (const k of Object.keys(cols)) {
          let v = r[cols[k]];
          if (isMoneyField(k)) {
            if (v == null || v === "") v = 0;
            if (typeof v === "string" && v.trim() === "-") {
              inputAlerts.push("Ô tiền " + k + " có dấu '-' dạng chữ, tạm quy đổi 0; cần xác nhận và đổi thành số 0 trong Excel.");
              v = 0;
            }
            if (typeof v !== "number" || !Number.isFinite(v))
              throw Error(
                "Số tiền không hợp lệ tại dòng " + h.sourceRow + ", cột " + k,
              );
            h[k] = v;
          } else h[k] = k === "handoverDate" ? formatDate(v) : String(v ?? "");
        }
        h.budget = [0, 1, 2, 3].map((n) => h["budget" + n]);
        h.paid = [0, 1, 2, 3].map((n) => h["paid" + n]);
        h.remaining = [0, 1, 2, 3].map((n) => h["remaining" + n]);
        h.openPaid = [0,1,2,3].map(n => h["openPaid"+n] ?? h.paid[n]);
        h.weekly = [0,1,2,3].map(n => h["weekly"+n] ?? 0);
        h.reasons = [0,1,2,3].map(n => h["reason"+n] || "");
        h.cumulative = cumulative;
        const sum = (a) => a.reduce((a, b) => a + b, 0);
        h.total = sum(h.budget);
        h.spent = sum(h.paid);
        h.left = sum(h.remaining);
        h.rate = h.total > 0 ? (h.spent / h.total) * 100 : null;
        h.delta = h.total - h.spent - h.left;
        h.alerts = inputAlerts;
        if (cumulative) {
          for (let n=0;n<4;n++) if (Math.abs(h.paid[n]-h.openPaid[n]-h.weekly[n])>1) h.alerts.push(groups[n]+": lũy kế khác đã chi đầu kỳ + chi trong tuần");
          if (Math.abs(h.refund-h.openRefund-h.weeklyRefund)>1) h.alerts.push("Chi tiền lũy kế = đầu kỳ + trong tuần");
        }
        for (let n = 0; n < 4; n++)
          if (Math.abs(h.budget[n] - h.paid[n] - h.remaining[n]) > 1)
            h.alerts.push(
              groups[n] +
                ": chênh lệch " +
                (h.budget[n] - h.paid[n] - h.remaining[n]).toLocaleString(
                  "vi-VN",
                ) +
                " đồng",
            );
        if (Math.abs(h.delta) > 1)
          h.alerts.push(
            "Dự toán − đã chi − chưa chi lệch " +
              h.delta.toLocaleString("vi-VN") +
              " đồng",
          );
        if (Math.abs(h.budgetTotal - h.total) > 1)
          h.alerts.push("Tổng dự toán khác tổng 4 nhóm");
        if (
          cols.remainingTotal !== undefined &&
          Math.abs(h.remainingTotal - h.left) > 1
        )
          h.alerts.push("Tổng chưa chi khác tổng 4 nhóm");
        if (h.rate !== null && (h.rate > 100 || h.rate < 0))
          h.alerts.push("Tỷ lệ ngoài khoảng 0–100%");
        if (h.alerts.length) issues.push(h);
        return h;
      })
      .filter(Boolean);
    if (!records.length) throw Error("Không có hồ sơ hợp lệ trong Excel.");
    let date = "Chưa xác định";
    for (const r of raw.rows.slice(0, 10)) {
      const n = r.findIndex((x) => norm(x).includes("thoi diem bao cao"));
      if (n >= 0) {
        const v = r.slice(n + 1).find((x) => x != null && x !== "");
        if (v instanceof Date) date = v.toLocaleDateString("vi-VN");
        else if (typeof v === "number" && g.XLSX) {
          let d = XLSX.SSF.parse_date_code(v);
          date = `${d.d}/${d.m}/${d.y}`;
        } else if (v)
          date = /^\d{4}-\d{2}-\d{2}/.test(v)
            ? v.slice(0, 10).split("-").reverse().join("/")
            : String(v);
      }
    }
    // Ô gộp I5:I8 lưu nội dung ghi chú chung tại ô đầu tiên I5.
    const reportNote = String(raw.rows[4]?.[8] ?? "").trim();
    return {
      records,
      issues,
      date,
      reportNote,
      sheet: raw.sheet,
      warnings: raw.warnings || [],
      source: raw.source || "RXT.xlsx",
    };
  }
  function summary(records) {
    return {
      budget: groups.map((_, n) =>
        records.reduce((s, h) => s + h.budget[n], 0),
      ),
      paid: groups.map((_, n) => records.reduce((s, h) => s + h.paid[n], 0)),
      remaining: groups.map((_, n) =>
        records.reduce((s, h) => s + h.remaining[n], 0),
      ),
      total: records.reduce((s, h) => s + h.total, 0),
      spent: records.reduce((s, h) => s + h.spent, 0),
      left: records.reduce((s, h) => s + h.left, 0),
      refund: records.reduce((s, h) => s + h.refund, 0),
      bank: records.reduce((s, h) => s + h.bank, 0),
    };
  }
  g.RXT = { groups, norm, parse, summary, mapping, isMoneyField, formatDate };
})(globalThis);
