window.renderDetail = function (h) {
  if (!h) return "<p>Không tìm thấy hồ sơ.</p>";
  return `<section class="panel detail">
      <div class="section-title">
        <div>
          <p>HỒ SƠ ${esc(h.stt)} · DÒNG EXCEL ${h.sourceRow}</p>
          <h2>${esc(h.name)}</h2><p>${esc(h.address)}</p>
        </div>
        <a class="button back-to-list" href="${esc(listHref())}">← Quay về danh sách</a>
      </div>
    <dl>${[    
    ["Phường", h.ward],
    ["CB thụ lý", h.officer],
    ["PA", h.plan],
    ["PA bổ sung", h.planExtra],
    ["PA bao gồm thay thế", h.planOld],
    ["QĐ phê duyệt dự toán", h.decisionBudget],
    ["QĐ phê duyệt PA", h.decisionPlan],
    ["QĐ bổ sung / điều chỉnh", h.decisionExtra],
    ["QĐ tạm cư", h.decisionHousing],
  ]
    .map(([a, b]) => `<dt>${a}</dt><dd>${esc(b || "—")}</dd>`)
    .join(
      "",
    )}</dl>${groupTable({ budget: h.budget, paid: h.paid, remaining: h.remaining })}
    <p>Tiến độ: <strong>${rate(h.rate)}</strong></p>
      <p>Nộp tiền bồi thường : ${money(h.refund)} · Tồn gửi ngân hàng : ${money(h.bank)}</p>${h.note ? 
        `<p class="notice">${esc(h.note)}</p>` : ""}${h.alerts.map((a) => 
          `<p class="notice">${esc(a)}</p>`).join("")}</section>`;
};
