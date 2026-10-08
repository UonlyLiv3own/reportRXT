window.renderReport = function () {
  const s = RXT.summary(state.records),
    low = state.records.filter((h) => h.rate !== null && h.rate < 50),
    zero = state.records.filter((h) => h.total > 0 && h.spent === 0);
  return `<section class="report-heading">
    <p>PHƯỜNG BÌNH THẠNH</p>
    <h2>BÁO CÁO TÌNH HÌNH GIẢI NGÂN</h2>
    <h3>Dự án Rạch Xuyên Tâm</h3>
    <p>Thời điểm báo cáo: ${esc(state.date)}</p>
    <button id="printReport">In báo cáo / Lưu PDF</button>
  </section>${kpis(s)}<section class="panel">
    <h2>Tình hình chi trả theo nhóm</h2>${bars(s)}${groupTable(s)}</section>
    <section class="panel report-notes">
      <h2>Nội dung cần theo dõi</h2>
      <div class="report-stats">
        <p><strong>${zero.length}</strong> hồ sơ chưa chi</p>
        <p><strong>${low.length}</strong> hồ sơ chi dưới 50% (gồm chưa chi)</p>
        <p><strong>${state.issues.length}</strong> hồ sơ có chênh lệch đối chiếu</p>
      </div>
          <p>Phạm vi: ${state.records.length} dòng hồ sơ/PA; không phải số hộ duy nhất. Tỷ lệ chung: ${rate(s.total > 0 ? (s.spent / s.total) * 100 : null)}.</p>
          <p>Nộp tiền bồi thường (V): ${money(s.refund)}; tồn gửi ngân hàng (AB): ${money(s.bank)}.</p>
          <p>Chênh lệch Dự toán − Đã chi − Chưa chi: <strong>${money(s.total - s.spent - s.left)}</strong>. Giữ số chưa chi theo nguồn Excel.</p>
          <p>Nguồn dữ liệu: ${esc(state.source)} · ${esc(state.sheet)}.</p>
  </section>${warningsPanel()}`;
};
window.warningsPanel = function () {
  return `<section class="panel"><details><summary>Đối chiếu số liệu: ${state.issues.length} hồ sơ chênh lệch · ${state.warnings.length} dòng Sheet2</summary>${recordTable(state.issues)}<h3>Danh sách BS tiền/NVTC không khớp (Sheet2)</h3><div class="table-wrap"><table><thead><tr><th>STT</th><th>Họ tên</th><th>PA</th><th>Địa chỉ</th></tr></thead><tbody>${state.warnings.map((r) => `<tr><td>${esc(r[0])}</td><td>${esc(r[6])}</td><td>${esc(r[5])}</td><td>${esc(r[8])}</td></tr>`).join("")}</tbody></table></div></details></section>`;
};
