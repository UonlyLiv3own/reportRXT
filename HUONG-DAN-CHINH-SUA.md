# Bản sửa: danh sách và chi tiết riêng

Giải nén vào thư mục mới, mở index.html bằng Live Server. Nếu thay vào source đang dùng, thay 6 file: js/app.js, js/detail.js, js/progress.js, js/report.js, css/style.css, css/report.css. Nhấn Ctrl+F5.

- pages/tien-do.html: danh sách hồ sơ, tìm kiếm và bộ lọc.
- Bấm tên hồ sơ → pages/chi-tiet.html?id=...: chỉ thông tin hồ sơ.
- Nút Quay về danh sách giữ từ khóa, mức chi, cán bộ, nhóm chi và giới hạn số dòng. URL mang bộ lọc; vị trí cuộn được khôi phục theo vị trí ghi lúc bảng được dựng.
- Chưa chọn hoặc ID không tồn tại: lời nhắc và nút quay về danh sách.
- Giữ giao diện, Excel và trang chào từ source bạn gửi.

## Ảnh image(8): các dòng Phạm vi / Nộp tiền / Chênh lệch / Nguồn

Nội dung được tạo trong js/report.js, hàm renderReport(). Tìm chữ “Phạm vi:” hoặc class “report-notes”. Không nằm trực tiếp trong pages/bao-cao.html.

Class mới: <section class="panel report-notes">. Quy tắc cuối css/report.css:

```css
.report-notes { padding: 24px; }
.report-notes > p { margin: 12px 0; }
```

padding chỉnh khoảng cách chữ đến viền khung, margin chỉnh khoảng cách giữa các dòng đoạn văn. Ví dụ padding: 20px 32px cho trên/dưới 20px và trái/phải 32px. Muốn đổi khoảng cách toàn khung với phần trước/sau, thêm margin: 22px 0 vào .report-notes. Các media query phía dưới xử lý điện thoại và in; sửa riêng chúng nếu cần.

## Ảnh image(9): bảng 4 nhóm chi trả

HTML bảng được tạo bởi hàm groupTable(s) trong js/app.js. Class bao ngoài mới: table-wrap group-table. Hàm này dùng chung cho tổng quan, báo cáo và chi tiết hồ sơ.

- css/style.css: .panel → lề bên trong toàn khung.
- css/style.css: th → padding tiêu đề cột.
- css/style.css: td → padding ô dữ liệu.
- Quy tắc .group-table cuối css/style.css → chỉnh riêng bảng này.

Ví dụ thêm cuối css/style.css:

```css
.group-table { margin: 16px 0 0; }
.group-table th,
.group-table td { padding: 12px 16px; }
```

Muốn chỉ thay bảng trong trang báo cáo:

```css
body[data-page="report"] .group-table td { padding: 16px; }
```

Đã căn phải tiêu đề 3 cột tiền để thẳng với số liệu. Nếu cần đổi lề bên ngoài toàn trang, tìm main trong css/style.css. Media query có thể ghi đè các giá trị khi màn hình nhỏ.

## Kiểm tra

Đã kiểm tra cú pháp JavaScript và việc dựng riêng trang chi tiết, liên kết quay về giữ bộ lọc, trường hợp không có ID / ID sai. Chưa kiểm tra trực quan trên trình duyệt trong môi trường này.
