# Mapping Excel → website Rạch Xuyên Tâm

Nguồn: 22-9 TỔNG HỢP BT HT, TĐC DA RXT - PHƯỜNG BÌNH THẠNH.xlsx

Sheet chính: Tổng hơp RXT - Bình Thạnh (2). Tiêu đề dòng 10–11; hồ sơ dòng 14–898. Dòng 12 là tổng, dòng 13 là số lượng; không cộng hai dòng này vào hồ sơ. Đơn vị: đồng. Ngày báo cáo: 22/09/2026 (ô E2).

| Cột | Nhóm | Tiêu đề Excel | Trường JS | Xử lý |
|---|---|---|---|---|
| A |  | CB thụ lý | `officer` | Lấy trực tiếp |
| B |  | STT | `stt` | Lấy trực tiếp |
| C |  | Số QĐ phê duyệt dự toán | `decisionBudget` | Lấy trực tiếp |
| D |  | Số QĐ phê duyệt PA | `decisionPlan` | Lấy trực tiếp |
| E |  | QĐ duyệt DT bổ sung, điều chỉnh | `decisionExtra` | Lấy trực tiếp |
| F |  | QĐ duyệt DT Tạm cư | `decisionHousing` | Lấy trực tiếp |
| G |  | STT Theo PA | `plan` | Lấy trực tiếp |
| H |  | PA Bổ sung | `planExtra` | Lấy trực tiếp |
| I |  | STT Theo PA (bao gồm PA bị thay thế) | `planOld` | Lấy trực tiếp |
| J |  | Họ tên | `name` | Lấy trực tiếp |
| K |  | Phường | `ward` | Lấy trực tiếp |
| L |  | Địa chỉ | `address` | Lấy trực tiếp |
| M | DỰ TOÁN | Tổng tiền chi Bồi thường | `budget0` | Lấy số Excel; đối chiếu |
| N | DỰ TOÁN | Tiền Bồi thường Bổ sung, NVTC | `budget1` | Lấy số Excel; đối chiếu |
| O | DỰ TOÁN | Thường bàn giao mặt bằng | `budget2` | Lấy số Excel; đối chiếu |
| P | DỰ TOÁN | Tạm cư | `budget3` | Lấy số Excel; đối chiếu |
| Q | DỰ TOÁN | Dự Toán | `budgetTotal` | Lấy số Excel; đối chiếu |
| R | ĐÃ CHI | Tổng tiền chi Bồi thường | `paid0` | Lấy số Excel; đối chiếu |
| S | ĐÃ CHI | Tiền Bồi thường Bổ sung, NVTC | `paid1` | Lấy số Excel; đối chiếu |
| T | ĐÃ CHI | Thường bàn giao mặt bằng | `paid2` | Lấy số Excel; đối chiếu |
| U | ĐÃ CHI | Tạm cư | `paid3` | Lấy số Excel; đối chiếu |
| V | ĐÃ CHI | Nộp tiền Bồi thường | `refund` | Lấy trực tiếp; không cộng vào đã chi |
| W | CHƯA CHI | Tổng tiền chi Bồi thường | `remaining0` | Lấy số Excel; đối chiếu |
| X | CHƯA CHI | Tiền Bồi thường Bổ sung, NVTC | `remaining1` | Lấy số Excel; đối chiếu |
| Y | CHƯA CHI | Thường bàn giao mặt bằng | `remaining2` | Lấy số Excel; đối chiếu |
| Z | CHƯA CHI | Tạm cư | `remaining3` | Lấy số Excel; đối chiếu |
| AA | CHƯA CHI | Tổng chưa chi (không có tiêu đề) | `remainingTotal` | Lấy số Excel; đối chiếu |
| AB |  | TỒN GỬI NGÂN HÀNG | `bank` | Lấy trực tiếp; không cộng vào đã chi |
| AC |  | Ghi chú (không có tiêu đề) | `note` | Lấy trực tiếp |

## Quy tắc tính

- Dự toán 4 nhóm: M, N, O, P. Đã chi: R, S, T, U. Chưa chi: W, X, Y, Z.
- Tổng từng chỉ tiêu = cộng 4 nhóm của các dòng hồ sơ; đối chiếu Q và AA theo hồ sơ. Không gộp hồ sơ theo tên: một tên có thể có nhiều PA/thay thế. Website gọi là “hồ sơ”, tránh coi 885 dòng là 885 hộ duy nhất.
- Tỷ lệ = tổng đã chi / tổng dự toán × 100. Dự toán bằng 0: không xác định; không đưa vào danh sách <50%. Danh sách <50% bao gồm hồ sơ chưa chi (0%).
- Giữ số chưa chi từ Excel; chênh lệch = dự toán − đã chi − chưa chi. Không tự sửa số để cân bằng. V (nộp tiền bồi thường) và AB (tồn gửi ngân hàng) hiển thị riêng, không tự diễn giải là tiền đã đến hộ.
- Các ô trống tài chính tính là 0; ô công thức phải có kết quả lưu từ Excel. Website chặn file thiếu cache công thức tài chính, không tự tính công thức bằng SheetJS.
- Bảng B5:G8 là số lượng PA/trường hợp, không phải số tiền; không dùng làm KPI tài chính.
- AA và AC không có tiêu đề: nhận diện theo vị trí cạnh 4 nhóm chưa chi và tồn ngân hàng, không suy đoán khi cấu trúc khác.
- Sheet2 có 22 dòng danh sách BS tiền/NVTC không khớp; hiển thị riêng để đối chiếu.
