const page = document.body.dataset.page;
const base = "../";

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
  return `<div class="table-wrap group-table">
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
            <td><a href="${esc(detailHref(h.id))}">${esc(h.name)}</a>
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
        <span class="brand-title">RẠCH XUYÊN TÂM
          <small>Báo Cáo Tổng Hợp</small>
        </span>
      </a>
      <p class="nav-label">PHƯỜNG BÌNH THẠNH</p>
      <nav>${[
        ["dashboard", "pages/tong-quan.html", "Tổng quan"],
        ["progress", "pages/tien-do.html", "Danh sách hồ sơ"],
        ["detail", "pages/chi-tiet.html", "Chi tiết hồ sơ"],
        ["report", "pages/bao-cao.html", "Báo cáo tổng hợp"],
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
          <h1>${{ dashboard: "Tổng quan giải ngân", progress: "Danh sách hồ sơ", detail: "Chi tiết hồ sơ", report: "Báo cáo tổng hợp" }[page]}</h1>
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
  const content = document.querySelector("#content");
  if (page === "dashboard") content.innerHTML = renderDashboard() + warningsPanel();
  else if (page === "report") content.innerHTML = renderReport();
  else if (page === "detail") {
    const id = new URLSearchParams(location.search).get("id");
    const h = state.records.find(h => h.id === id);
    content.innerHTML = h ? renderDetail(h) : `<section class="panel"><h2>${id ? "Không tìm thấy hồ sơ" : "Vui lòng chọn hồ sơ từ danh sách"}</h2><p>Chọn một hồ sơ để xem PA, quyết định và tình hình chi trả.</p><a class="button" href="${esc(listHref())}">← Quay về danh sách</a></section>`;
  } else {
    content.innerHTML = renderProgress();
    const params = new URLSearchParams(location.search);
    for (const id of ["search", "status", "officer", "group"]) {
      const control = document.querySelector("#" + id);
      const value = params.get(id);
      if (value !== null) control.value = value;
      if (control.tagName === "SELECT" && control.selectedIndex < 0) control.selectedIndex = 0;
      control.addEventListener(id === "search" ? "input" : "change", () => {
        tableLimit = 30;
        showResults();
      });
    }
    const limit = Number(params.get("limit"));
    if (Number.isFinite(limit) && limit >= 30) tableLimit = Math.min(limit, state.records.length);
    document.querySelector("#exportCsv").onclick = exportCsv;
    showResults();
    const scroll = Number(params.get("scroll"));
    if (scroll > 0) requestAnimationFrame(() => window.scrollTo(0, scroll));
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
        if (page === "progress") showResults();
        else render();
      }),
  );
}
function showResults() {
  const url = new URL(location.href);
  for (const key of ["search", "status", "officer", "group"]) url.searchParams.set(key, document.querySelector("#" + key).value);
  url.searchParams.set("limit", tableLimit);
  history.replaceState(null, "", url.href);
  filtered = filterRecords();
  document.querySelector("#results").innerHTML = recordTable(filtered);
  bindAll();
}
// URL mang theo bộ lọc để quay lại đúng danh sách, không dùng history.back().
function listHref() {
  const params = new URLSearchParams(location.search);
  const url = new URL("tien-do.html", location.href);
  for (const key of ["search", "status", "officer", "group", "limit", "scroll"]) {
    if (params.has(key)) url.searchParams.set(key, params.get(key));
  }
  return url.href;
}
function detailHref(id) {
  const url = new URL("chi-tiet.html", location.href);
  url.searchParams.set("id", id);
  if (page === "progress") {
    for (const key of ["search", "status", "officer", "group"]) {
      url.searchParams.set(key, document.querySelector("#" + key).value);
    }
    url.searchParams.set("limit", tableLimit);
    url.searchParams.set("scroll", window.scrollY || 0);
  }
  return url.href;
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
