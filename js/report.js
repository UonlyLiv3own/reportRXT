window.renderReport = function () {
  const s = RXT.summary(state.records),
    low = state.records.filter((h) => h.rate !== null && h.rate < 50),
    zero = state.records.filter((h) => h.total > 0 && h.spent === 0);
  return `<section class="report-heading">
    <p>ỦY BAN NHÂN DÂN PHƯỜNG BÌNH THẠNH</p>
    <h1>BÁO CÁO TÌNH HÌNH CHI TIỀN GIẢI PHÓNG MẶT BẰNG</h1>
    <h2>Dự án Rạch Xuyên Tâm</h2>
    <p>Thời điểm báo cáo: ${esc(state.date)}</p>
    <button id="printReport">In báo cáo / Lưu PDF</button>
  </section>${kpis(s)}<section class="panel">
    <h2>Tình hình chi trả theo nhóm</h2>${bars(s)}${groupTable(s)}</section>
    <section class="panel report-notes">
      <h2>Nội dung cần theo dõi</h2>
      <div class="report-stats">
        <p><strong>${zero.length}</strong> hồ sơ chưa chi</p>
        <p><strong>${low.length}</strong> hồ sơ chi dưới 50% (gồm chưa chi)</p>
        <p><strong>${state.issues.length}</strong> hồ sơ cần kiểm tra dữ liệu</p>
      </div>
      <div class="report-grid">
        <p>Phạm vi khái quát : <strong>${state.records.length}</strong> dòng dữ liệu hồ sơ. <br> <span>không phải số hộ duy nhất - một hộ có thể có nhiều PA.</span> </p>
        <p>Tỷ lệ chung : <strong>${rate(s.total > 0 ? (s.spent / s.total) * 100 : null)}</strong>.<br> <span>Tổng đã chi ÷ Tổng dự toán × 100</span> </p>
        <p>Nộp trả tiền bồi thường : <strong>${money(s.refund)}</strong>.</p>
        <p>Tổng tiền tồn gửi ngân hàng : <strong>${money(s.bank)}</strong>.</p>
        <p>Chênh lệch Dự toán − Đã chi − Chưa chi : <strong>${money(s.total - s.spent - s.left)}</strong>.<br> <span>Giữ số chưa chi theo nguồn Excel.</span> </p>
        <p>Nguồn dữ liệu : <strong>${esc(state.source)} · ${esc(state.sheet)}</strong>.</p>
      </div>
  </section>${warningsPanel()}`;
};
window.warningsPanel = function () {
  return `<section class="panel">
  <details>
    <summary>Đối chiếu số liệu : ${state.issues.length} hồ sơ cần kiểm tra dữ liệu · ${state.warnings.length} dòng</summary>${recordTable(state.issues)}
    <h3>Danh sách BS tiền/NVTC không khớp (Sheet2)</h3>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Họ tên</th>
            <th>PA</th>
            <th>Địa chỉ</th>
          </tr>
        </thead>
        <tbody>${state.warnings.map((r) => 
          `<tr>
            <td>${esc(r[0])}</td>
            <td>${esc(r[6])}</td>
            <td>${esc(r[5])}</td>
            <td>${esc(r[8])}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
  </details></section>`;
};
