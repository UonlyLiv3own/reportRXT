const page = document.body.dataset.page,
  base = page === "dashboard" ? "" : "../";
let state,
  filtered = [],
  tableLimit = 30;
const esc = (x) =>
  String(x ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const money = (x) => Number(x || 0).toLocaleString("vi-VN") + " đ",
  billion = (x) =>
    (x / 1e9).toLocaleString("vi-VN", { maximumFractionDigits: 3 }),
  rate = (x) =>
    x === null
      ? "Không xác định"
      : x.toLocaleString("vi-VN", { maximumFractionDigits: 2 }) + "%";
function kpis(s) {
  return `<div class="kpis">${[
    ["DỰ TOÁN", s.total, "budget"],
    ["ĐÃ CHI", s.spent, "paid"],
    ["CHƯA CHI", s.left, "remaining"],
  ]
    .map(
      ([n, v, k]) =>
        `<section class="kpi ${k}">
          <p>${n}</p>
          <strong>${billion(v)} <small>tỷ đồng</small></strong>
          <span>${money(v)}</span>
        </section>`,
    )
    .join("")}</div>`;
}
function groupTable(s) {
  return `<div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Nhóm chi trả</th>
          <th>Dự toán (đ)</th>
          <th>Đã chi (đ)</th>
          <th>Chưa chi (đ)</th>
          <th>Tỷ lệ</th>
        </tr>
      </thead>
      <tbody>${RXT.groups.map((n, i) => 
        `<tr>
          <td>${n}</td>
          <td class="num">${money(s.budget[i])}</td>
          <td class="num">${money(s.paid[i])}</td>
          <td class="num">${money(s.remaining[i])}</td>
          <td>${rate(s.budget[i] > 0 ? (s.paid[i] / s.budget[i]) * 100 : null)}</td>
        </tr>`).join("")}
      </tbody>
    </table>
  </div>`;
}
function recordTable(records) {
  return `<p class="result-count">${records.length} hồ sơ${records.length > tableLimit ? ` · đang hiển thị ${tableLimit} đầu tiên` : ""}</p>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Họ tên / PA</th>
            <th>Địa chỉ</th>
            <th>Dự toán (đ)</th>
            <th>Đã chi (đ)</th>
            <th>Chưa chi (đ)</th>
            <th>Tỷ lệ</th>
          </tr>
        </thead>
        <tbody>${
    records
      .slice(0, tableLimit)
      .map(
        (h) =>
          `<tr>
            <td>${esc(h.stt)}</td>
            <td><a href="${base}pages/chi-tiet.html?id=${h.id}">${esc(h.name)}</a>
                <small>${esc(h.plan)}</small>${h.alerts.length ? 
                '<small class="flag">Có chênh lệch</small>' : ""}</td>
            <td>${esc(h.address)}</td>
            <td class="num">${money(h.total)}</td>
            <td class="num">${money(h.spent)}</td>
            <td class="num">${money(h.left)}</td>
            <td><span class="badge ${h.rate !== null && h.rate < 50 ? "low" : "ok"}">${rate(h.rate)}</span></td>
          </tr>`,
      ).join("") || '<tr> <td colspan="7">Không có hồ sơ phù hợp.</td> </tr>'
        }</tbody>
      </table>
    </div>${records.length > tableLimit ? 
    '<button class="showAll">Hiển thị toàn bộ danh sách</button>' : ""}`;
}
function shell() {
  document.querySelector("#app").innerHTML =
    `<aside>
      <a class="brand" href="${base}index.html">
        <span class="brand-icon">RXT</span>
        <strong>Rạch Xuyên Tâm
          <small>QUẢN LÝ GIẢI NGÂN</small>
        </strong></a>
      <p class="nav-label">PHƯỜNG BÌNH THẠNH</p>
      <nav>${[
        ["dashboard", "index.html", "Tổng quan"],
        ["detail", "pages/chi-tiet.html", "Chi tiết dự án"],
        ["progress", "pages/tien-do.html", "Theo dõi tiến độ"],
        ["report", "pages/bao-cao.html", "Báo cáo lãnh đạo"],
      ]
        .map(
          ([k, u, n], i) =>
            `<a class="${page === k ? "active" : ""}" href="${base}${u}"><span>0${i + 1}</span>${n}</a>`,
        )
        .join(
          "",
        )
      }</nav>
      
      <div class="sidebar-note">Bồi thường, hỗ trợ<br>và tái định cư<br>
        <b>Dự án Rạch Xuyên Tâm</b>
      </div>
    </aside>
    
    <main>
      <header>
        <div>
          <p>DỰ ÁN RẠCH XUYÊN TÂM</p>
          <h1>${{ dashboard: "Tổng quan giải ngân", detail: "Chi tiết dự án", progress: "Theo dõi tiến độ", report: "Báo cáo lãnh đạo" }[page]}</h1>
        </div>
        <div class="actions">
          <label class="button">Nhập Excel mới<input id="excelInput" type="file" accept=".xlsx" hidden></label>
          <button id="resetData">Dùng file gốc</button>
        </div>
      </header>
      <div id="message" role="status"></div>
      <div id="content"></div>
      <footer>Chỉ theo dõi dự án Rạch Xuyên Tâm · Đơn vị tiền: đồng Việt Nam</footer>
    </main>`;
  document.querySelector("#excelInput").onchange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const buffer = await f.arrayBuffer(),
        raw = await readRXTExcel(buffer, f.name),
        next = RXT.parse(raw);
      await rxtStore("set", { buffer, source: f.name });
      state = next;
      tableLimit = 30;
      render();
    } catch (err) {
      message(err.message, true);
    } finally {
      e.target.value = "";
    }
  };
  document.querySelector("#resetData").onclick = async () => {
    try {
      await rxtStore("delete");
      state = await loadDefault();
      tableLimit = 30;
      render();
    } catch (err) {
      message(err.message, true);
    }
  };
}
function message(t, error = false) {
  document.querySelector("#message").innerHTML =
    `<p class="${error ? "notice" : "source"}">${esc(t)}</p>`;
}
async function loadDefault() {
  if (location.protocol !== "file:") {
    const res = await fetch(base + "data/RXT.xlsx");
    if (!res.ok) throw Error("Không tải được data/RXT.xlsx.");
    return RXT.parse(await readRXTExcel(await res.arrayBuffer(), "RXT.xlsx"));
  }
  return RXT.parse(RXT_SNAPSHOT);
}
function render() {
  message(
    `Thời điểm báo cáo: ${state.date} · ${state.records.length} hồ sơ · Nguồn: ${state.source} · ${state.issues.length} hồ sơ cần đối chiếu.`,
  );
  document.querySelector("#content").innerHTML =
    page === "dashboard"
      ? renderDashboard() + warningsPanel()
      : page === "report"
        ? renderReport()
        : renderProgress();
  if (page === "detail" || page === "progress") {
    const params = new URLSearchParams(location.search);
    document.querySelector("#status").value = params.get("status") || "all";
    for (const id of ["search", "status", "officer", "group"])
      document
        .querySelector("#" + id)
        .addEventListener(id === "search" ? "input" : "change", () => {
          tableLimit = 30;
          showResults();
        });
    document.querySelector("#exportCsv").onclick = exportCsv;
    showResults();
    if (params.get("id")) showDetail(params.get("id"));
  }
  document
    .querySelector("#printReport")
    ?.addEventListener("click", () => window.print());
  bindAll();
}
function bindAll() {
  document.querySelectorAll(".showAll").forEach(
    (b) =>
      (b.onclick = () => {
        tableLimit = state.records.length;
        if (page === "progress" || page === "detail") showResults();
        else render();
      }),
  );
}
function showResults() {
  filtered = filterRecords();
  document.querySelector("#results").innerHTML = recordTable(filtered);
  bindAll();
}
function showDetail(id) {
  const h = state.records.find((h) => h.id === id);
  document.querySelector("#detail").innerHTML = renderDetail(h);
  document.querySelector("#closeDetail")?.addEventListener("click", () => {
    document.querySelector("#detail").innerHTML = "";
    history.replaceState({}, "", location.pathname);
  });
  document.querySelector("#detail").scrollIntoView({ behavior: "smooth" });
}
function exportCsv() {
  const cell = (v) =>
    '"' +
    String(v ?? "")
      .replace(/"/g, '""')
      .replace(/^[=+@-]/, "'$&") +
    '"';
  const rows = [
    [
      "STT",
      "Họ tên",
      "Địa chỉ",
      "PA",
      "CB thụ lý",
      "Dự toán",
      "Đã chi",
      "Chưa chi",
      "Tỷ lệ %",
    ],
    ...filtered.map((h) => [
      h.stt,
      h.name,
      h.address,
      h.plan,
      h.officer,
      h.total,
      h.spent,
      h.left,
      h.rate,
    ]),
  ];
  const a = document.createElement("a"),
    url = URL.createObjectURL(
      new Blob(
        ["\ufeff" + rows.map((r) => r.map(cell).join(",")).join("\r\n")],
        { type: "text/csv;charset=utf-8" },
      ),
    );
  a.href = url;
  a.download = "RXT-danh-sach.csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
(async () => {
  shell();
  message("Đang đọc dữ liệu Excel…");
  try {
    let stored;
    try {
      stored = await rxtStore("get");
    } catch {}
    state = stored
      ? RXT.parse(await readRXTExcel(stored.buffer, stored.source))
      : await loadDefault();
    render();
  } catch (err) {
    message(err.message, true);
  }
})();
