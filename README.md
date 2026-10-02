# RXT – Quản lý giải ngân

Website độc lập cho dự án Rạch Xuyên Tâm – phường Bình Thạnh. HTML/CSS/JavaScript thuần, không framework, không backend. Kèm file Excel gốc ngày 22/09/2026 và thư viện SheetJS 0.20.3 chạy nội bộ, không cần CDN khi sử dụng.

## Dùng nhanh

1. Giải nén toàn bộ thư mục `RXT-GIAI-NGAN`.
2. Mở `index.html` bằng Chrome/Edge. Lần đầu sẽ hiển thị bản dữ liệu đã trích từ đúng Excel kèm theo.
3. Bấm **Nhập Excel mới** để đọc file `.xlsx` trực tiếp và cập nhật tất cả trang.
4. Vào **Báo cáo lãnh đạo → In báo cáo / Lưu PDF**, chọn khổ A4 ngang và bật in màu nền nếu cần.

File đã nhập được lưu trong IndexedDB của trình duyệt hiện tại để giữ dữ liệu khi chuyển trang/tải lại. Đây là cập nhật trên máy đang dùng, không tự đồng bộ cho máy của lãnh đạo. Một số trình duyệt hạn chế IndexedDB khi mở file trực tiếp; khi đó hãy chạy website bằng máy chủ tĩnh như hướng dẫn dưới đây. Nếu lưu dữ liệu nhập thất bại, website báo lỗi và không thay dữ liệu đang dùng.

## Chạy bằng máy chủ tĩnh (khuyến nghị)

Nếu máy có Python, mở terminal tại thư mục RXT-GIAI-NGAN:

```bash
python -m http.server 8080
```

Mở `http://localhost:8080`. Khi chạy qua HTTP/HTTPS, website đọc trực tiếp `data/RXT.xlsx`, không dùng bản trích sẵn. Chạy trên máy chủ tĩnh khác cũng tương tự.

## Cập nhật dữ liệu cho tất cả người xem

- Mở Excel, tính lại công thức và lưu.
- Thay `data/RXT.xlsx` trên nơi đặt website bằng file mới cùng cấu trúc tiêu đề.
- Người xem bấm **Dùng file gốc** nếu trình duyệt đang giữ một file nhập riêng. Website tải lại file Excel trên máy chủ.
- Khi chỉ mở HTML bằng cách nhấp đúp, hãy dùng **Nhập Excel mới**; thay file XLSX bên cạnh không tự thay bản dữ liệu trích sẵn.
- Ngày báo cáo lấy từ mục “Thời điểm báo cáo” trong Excel, không suy từ tên file.

## Các trang

- `index.html` / `pages/tong-quan.html`: 3 chỉ tiêu, biểu đồ theo 4 nhóm, danh sách hồ sơ chi dưới 50%, đối chiếu.
- `pages/chi-tiet.html`: tìm hồ sơ, PA, PA bổ sung/thay thế, quyết định, cán bộ, số tiền theo nhóm.
- `pages/tien-do.html`: lọc mức chi, cán bộ và nhóm chi; xuất CSV danh sách đang lọc.
- `pages/bao-cao.html`: báo cáo tổng hợp và in / lưu PDF.

Bấm tên trong bảng để mở đầy đủ chi tiết. Dữ liệu hiển thị 30 dòng đầu để dễ đọc; bấm “Hiển thị toàn bộ danh sách” để xem tất cả kết quả.

## Cấu trúc

```text
RXT-GIAI-NGAN/
  index.html
  pages/ tong-quan.html, chi-tiet.html, tien-do.html, bao-cao.html
  css/ style.css, dashboard.css, report.css
  js/ app.js, mapping.js, excel.js, data.js, dashboard.js, detail.js, progress.js, report.js
  data/ RXT.xlsx, snapshot.js
  assets/ favicon.svg, vendor/xlsx.full.min.js
  MAPPING.md
  README.md
  VALIDATION.md
```

`mapping.js` tập trung tên trường và tiêu đề. `data.js` nhận diện tiêu đề 2 tầng, không phụ thuộc số cột cố định; từ chối nhập khi thiếu cột cần thiết. `excel.js` đọc XLSX và kiểm tra cache công thức. `snapshot.js` chỉ là bản trích tự động giúp mở bằng file trực tiếp lần đầu, không phải dữ liệu cần sửa bằng tay. Không cần chuyển Excel sang JSON thủ công.

## Quy tắc số liệu

Xem `MAPPING.md` để có mapping đầy đủ A–AC. Bảng chỉ tiêu đầu Excel là số lượng, không phải số tiền. Dữ liệu chính gồm 885 dòng hồ sơ/PA; chưa suy ra số hộ duy nhất do có PA thay thế và trường hợp cùng tên.

Không cộng “Nộp tiền bồi thường” (V) hay “Tồn gửi ngân hàng” (AB) vào “Đã chi”. Số “Chưa chi” lấy từ Excel; đối chiếu chênh lệch theo từng nhóm và theo tổng hồ sơ. Không tự gộp PA thay thế, tự sửa số hoặc suy đoán tình trạng hồ sơ pháp lý từ ô trống. Hồ sơ dự toán bằng 0 không có tỷ lệ và không đưa vào danh sách dưới 50%. Tỷ lệ vượt 100% được giữ nguyên và cảnh báo, không ép về 100%.

SheetJS đọc kết quả công thức đã lưu, không tính lại công thức. Khi file có công thức tiền không có kết quả hợp lệ, website yêu cầu tính lại bằng Excel và lưu trước khi nhập.

## Giới hạn

Đây là bản theo dõi dựa trên Excel, chưa có chỉnh sửa trực tiếp từng hồ sơ, tài khoản, phân quyền hay nhật ký nhiều người dùng. Không dùng lịch sử tháng giả để vẽ xu hướng. Source kèm dữ liệu họ tên/địa chỉ thật; chỉ đưa website lên nơi bạn chủ động cho phép người xem truy cập.
