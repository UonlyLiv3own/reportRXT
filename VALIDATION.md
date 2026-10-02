# Đối chiếu file nguồn 22/09/2026

| Nhóm | Dự toán (đ) | Đã chi (đ) | Chưa chi (đ) |
|---|---:|---:|---:|
| Bồi thường lần đầu | 3.763.781.053.926 | 3.652.020.929.062 | 112.715.572.876 |
| Bổ sung, NVTC | 198.719.183.148 | 178.113.848.714 | 19.649.886.422 |
| Thưởng bàn giao | 10.312.500.000 | 8.542.500.000 | 1.770.000.000 |
| Tạm cư | 11.905.266.691 | 7.152.400.018 | 4.752.866.673 |
| **Tổng** | **3.984.718.003.765** | **3.845.829.677.794** | **138.888.325.971** |

- 885 dòng hồ sơ; 68 hồ sơ chi <50%, gồm 62 hồ sơ chưa chi.
- Sheet2: 22 dòng đối chiếu BS tiền/NVTC không khớp.
- Có 1 hồ sơ lệch theo nhóm dù tổng 4 nhóm vẫn cân bằng; website hiển thị cảnh báo thay vì tự sửa nguồn.
- Tổng từng nhóm khớp các ô tổng Excel dòng 12.
- Đã kiểm tra nhận diện cột khi chèn thêm cột trống; tổng vẫn giữ đúng.
- Đã kiểm tra từ chối số tiền không hợp lệ.

- Đã chạy kiểm tra sinh HTML của 4 trang, tìm kiếm tiếng Việt và escape nội dung.
- Chưa kiểm tra trực quan và thao tác trên trình duyệt: môi trường không có trình duyệt chạy được. Cần mở thử tại máy sử dụng để xác nhận giao diện và bố cục in.


## Vai trò của các file JavaScript
| File | Nhiệm vụ |
|---|---:|
| xlsx.full.min.js | Thư viện giúp đọc file Excel |
| snapshot.js | Dữ liệu trích sẵn từ Excel gốc, dùng khi mở HTML trực tiếp lần đầu |
| mapping.js | Khai báo cột Excel tương ứng với trường dữ liệu nào |
| excel.js | Đọc XLSX và lưu file đã nhập trên trình duyệt |
| data.js | Chuẩn hóa hồ sơ, tính tổng, tỷ lệ và chênh lệch |
| dashboard.js | Tạo nội dung tổng quan |
| detail.js	| Tạo nội dung chi tiết một hồ sơ |
| progress.js | Tạo danh sách và bộ lọc |
| report.js	| Tạo nội dung báo cáo lãnh đạo |
| app.js | Kết nối dữ liệu, giao diện và thao tác người dùng |

## SETUP GIT CREATE NEW REPOSITORY
git init
git config --global user.email "email_cua_ban@example.com"
git config --global user.name "Ten Cua Ban"
git branch -M main
git add .
git commit -m "first commit"
git remote add origin https://github.com/UonlyLiv3own/**repositoryName**.git
git push -u origin main