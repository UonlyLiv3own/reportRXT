# CẬP NHẬT SOURCE CHO CẤU TRÚC EXCEL MỚI

1. Sao lưu source hiện tại.
2. Copy 6 file trong js/ của bộ này vào js/ dự án, thay file cùng tên:
   mapping.js, data.js, excel.js, app.js, detail.js, report.js.
   Giữ nguyên dashboard.js, progress.js và các file JS khác đang có.
3. Copy css/style.css vào css/style.css dự án. Giữ report.css, dashboard.css và landing.css hiện tại.
4. Nhấn Ctrl+F5, bấm Nhập Excel mới và chọn báo cáo cấu trúc mới.
5. Chọn hồ sơ để kiểm tra Lý do từng nhóm, Bố trí tái định cư, Ngày bàn giao, Đề xuất.

Đây là bộ file thay thế, không phải source đầy đủ. Không cần sửa HTML, không đổi thứ tự script.
Không đưa dữ liệu thử thành dữ liệu mặc định trong gói này. Khi có báo cáo thật, tính lại và lưu Excel, thay **data/RXT.xlsx** để mọi người dùng cùng nguồn. Nếu mở HTML bằng file://, phải nhập Excel mới; snapshot.js cũ không tự đổi theo file XLSX.

Sheet chính: Tổng hơp RXT - Bình Thạnh (có thể viết Tổng hợp; bộ chuẩn hóa bỏ dấu). Không tự đọc (2) hoặc Tạm cư. Nếu dùng Excel cũ mà chỉ có sheet (2), ứng dụng báo lỗi; dùng nút Nhập Excel mới để chọn file đúng.

## FIELD VÀ CÁCH TÍNH
- openPaid0..3: T..W, đã chi đầu kỳ; openRefund: X.
- weekly0..3: Y..AB, chi trong tuần; weeklyRefund: AC.
- paid0..3: AD..AG, lũy kế; refund: AH.
- budget0..3: O..R; budgetTotal: S.
- remaining0..3: AI..AL; bank: AM.
- reason0..3: AN..AQ, chỉ là chữ; proposal: AR.
- resettlement: J; handoverDate: K; tên/phường/địa chỉ: L..N.
Bộ đọc nhận tiêu đề theo nhóm, không phụ thuộc vị trí chữ cái cột; mapping.column để tham khảo.

Dashboard và tỷ lệ dùng lũy kế, không cộng lặp đầu kỳ/chi tuần. Trang chi tiết hiện thêm bảng đầu kỳ–trong tuần–lũy kế. Đối chiếu lũy kế với đầu kỳ + trong tuần, giữ số nguồn, cảnh báo khi lệch. Nộp tiền bồi thường không cộng vào đã chi 4 nhóm.

## DẤU GẠCH TRONG Ô TIỀN
File mẫu có '-' dạng chữ. Để dùng thử được, bộ đọc tạm coi dấu '-' là 0 và cảnh báo từng hồ sơ. Không chuyển tùy tiện các chữ khác thành 0. Trước báo cáo thật, đổi các ô này thành số 0 nếu đúng nghiệp vụ; dùng định dạng Excel để hiển thị gạch. File mẫu hiện có 140 hồ sơ cảnh báo dấu gạch, không phải kết luận 140 hồ sơ sai nghiệp vụ.
Công thức phải có kết quả lưu; mở Excel tính lại và lưu trước khi nhập. Lũy kế trong mẫu là giá trị nhập sẵn; ứng dụng chỉ đối chiếu, không ghi công thức lại vào Excel.

## KIỂM TRA ĐÃ THỰC HIỆN
- Đọc file cấu trúc mới: 884 hồ sơ; lý do theo 4 nhóm không lẫn cột tiền.
- Tổng tiền trùng các tổng nguồn; đây là xác nhận bộ đọc, không chứng nhận dữ liệu thử là báo cáo thật.
- Đọc ngày, đề xuất; thử chèn cột trống vẫn nhận đúng.
- Thử thay chi tuần/lũy kế để kiểm tra đối chiếu và không cộng trùng.
- Chặn chữ không hợp lệ trong cột tiền.
- Kiểm tra bảng chi tiết có lý do, bảng tổng quan/báo cáo giữ 5 cột.
- Chưa kiểm tra trực quan trên trình duyệt trong môi trường này.
--------------------------------------------------------------------------

# Bản sửa mục Danh sách HS và chi tiết HS riêng

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
