window.renderProgress = function () {
  return `<section class="panel">
    <div class="section-title">
      <div>
        <h2>Danh sách hồ sơ</h2>
        <p>Tìm theo họ tên, địa chỉ, PA, quyết định · không gộp các PA có cùng tên.</p>
      </div>
      <button id="exportCsv">Xuất danh sách CSV</button>
    </div>
    
    <div class="filters">
      <input id="search" aria-label="Tìm hồ sơ" placeholder="Tìm tên, địa chỉ, PA, QĐ…">
      <select id="status" aria-label="Mức chi">
        <option value="all">Tất cả mức chi</option>
        <option value="zero">Chưa chi</option>
        <option value="low">Đã chi dưới 50%</option>
        <option value="middle">50% đến dưới 100%</option>
        <option value="done">Đã chi đủ / vượt</option>
        <option value="undefined">Dự toán bằng 0</option>
        <option value="issue">Chênh lệch đối chiếu</option>
      </select>
      <select id="officer" aria-label="Cán bộ thụ lý">
        <option value="">Tất cả cán bộ</option>${[
      ...new Set(state.records.map((h) => h.officer)),  ]
      .sort().map((n) => `<option>${esc(n)}</option>`).join("",
      )}</select>
      <select id="group" aria-label="Nhóm tiền">
        <option value="all">Tổng 4 nhóm</option>${RXT.groups.map((n, i) => `<option value="${i}">${n}</option>`).join("")}
      </select>
    </div>
    <div id="results"></div>
  </section>`;
};
window.filterRecords = function () {
  const q = RXT.norm(document.querySelector("#search").value),
    st = document.querySelector("#status").value,
    off = document.querySelector("#officer").value,
    gr = document.querySelector("#group").value;
  return state.records
    .map((h) => {
      if (gr === "all") return h;
      let n = Number(gr);
      return {
        ...h,
        total: h.budget[n],
        spent: h.paid[n],
        left: h.remaining[n],
        rate: h.budget[n] > 0 ? (h.paid[n] / h.budget[n]) * 100 : null,
      };
    })
    .filter((h) => {
      const ok =
        st === "all" ||
        (st === "zero" && h.total > 0 && h.spent === 0) ||
        (st === "low" && h.rate !== null && h.rate < 50) ||
        (st === "middle" && h.rate >= 50 && h.rate < 100) ||
        (st === "done" && h.rate >= 100) ||
        (st === "undefined" && h.rate === null) ||
        (st === "issue" && h.alerts.length);
      return (
        ok &&
        (!off || h.officer === off) &&
        (!q ||
          RXT.norm(
            [
              h.name,
              h.address,
              h.plan,
              h.planExtra,
              h.planOld,
              h.decisionBudget,
              h.decisionPlan,
              h.decisionExtra,
              h.decisionHousing,
            ].join(" "),
          ).includes(q))
      );
    });
};
