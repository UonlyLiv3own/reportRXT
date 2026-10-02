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
    for (let i = 0; i < Math.max(upper.length, lower.length); i++) {
      const a = norm(upper[i]),
        b = norm(lower[i]);
      if (["du toan", "da chi", "chua chi"].includes(a)) section = a;
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
    const nt = cols.bank + 1;
    if (!upper[nt] && !lower[nt]) cols.note = nt;
    return { cols, start: top + 4 };
  }
  function parse(raw) {
    const { cols, start } = mapping(raw.rows);
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
        for (const k of Object.keys(cols)) {
          let v = r[cols[k]];
          if (/^(budget|paid|remaining|refund|bank)/.test(k)) {
            if (v == null || v === "") v = 0;
            if (typeof v !== "number" || !Number.isFinite(v))
              throw Error(
                "Số tiền không hợp lệ tại dòng " + h.sourceRow + ", cột " + k,
              );
            h[k] = v;
          } else h[k] = String(v ?? "");
        }
        h.budget = [0, 1, 2, 3].map((n) => h["budget" + n]);
        h.paid = [0, 1, 2, 3].map((n) => h["paid" + n]);
        h.remaining = [0, 1, 2, 3].map((n) => h["remaining" + n]);
        const sum = (a) => a.reduce((a, b) => a + b, 0);
        h.total = sum(h.budget);
        h.spent = sum(h.paid);
        h.left = sum(h.remaining);
        h.rate = h.total > 0 ? (h.spent / h.total) * 100 : null;
        h.delta = h.total - h.spent - h.left;
        h.alerts = [];
        for (let n = 0; n < 4; n++)
          if (Math.abs(h.budget[n] - h.paid[n] - h.remaining[n]) > 1)
            h.alerts.push(
              groups[n] +
                ": chênh lệch " +
                (h.budget[n] - h.paid[n] - h.remaining[n]).toLocaleString(
                  "vi-VN",
                ) +
                " đ",
            );
        if (Math.abs(h.delta) > 1)
          h.alerts.push(
            "Dự toán − đã chi − chưa chi lệch " +
              h.delta.toLocaleString("vi-VN") +
              " đ",
          );
        if (Math.abs(h.budgetTotal - h.total) > 1)
          h.alerts.push("Tổng dự toán Q khác tổng 4 nhóm");
        if (
          cols.remainingTotal !== undefined &&
          Math.abs(h.remainingTotal - h.left) > 1
        )
          h.alerts.push("Tổng chưa chi AA khác tổng 4 nhóm");
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
    return {
      records,
      issues,
      date,
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
  g.RXT = { groups, norm, parse, summary, mapping };
})(globalThis);
