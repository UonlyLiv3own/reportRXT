window.renderDashboard = function () {
  const s = RXT.summary(state.records);
  return (
    kpis(s) +
    `<section class="panel">
      <div class="section-title">
        <div>
          <h2>Giải ngân theo nhóm</h2>
          <p>Đơn vị: tỷ đồng · số chưa chi theo Excel</p>
        </div>
        <div class="legend">
          <span class="budget">Dự toán</span>
          <span class="paid">Đã chi</span>
          <span class="remaining">Chưa chi</span>
        </div>
      </div>${bars(s)}${groupTable(s)}</section>
    
      <section class="panel">
        <div class="section-title">
          <div>
            <h2>Hồ sơ đã chi dưới 50%</h2>
            <p>Bao gồm hồ sơ chưa chi; chỉ tính hồ sơ có dự toán &gt; 0.</p>
          </div>
          <a href="${base}pages/tien-do.html?status=low">Xem toàn bộ →</a>
        </div>${recordTable(state.records.filter((h) => h.rate !== null && h.rate < 50))}</section>`
  );
};
window.bars = (s) => {
  const max = Math.max(...s.budget, ...s.paid, ...s.remaining, 1);
  return `<div class="chart" role="img" aria-label="Biểu đồ dự toán, đã chi, chưa chi theo bốn nhóm">${RXT.groups.map((g, i) => 
      `<div class="chart-row">
        <strong>${g}</strong>
        <div>${["budget", "paid", "remaining"].map((k) => 
          `<div class="barline">
            <div class="bar ${k}" style="width:${(Math.max(0, s[k][i]) / max) * 85}%"></div>
            <span>${billion(s[k][i])}</span>
          </div>`).join("")}
        </div>
      </div>`).join("")}</div>`;
};
