# Kết quả kiểm tra ngày 16/09/2026

**Kết luận: luồng chính chạy được sau sửa lỗi; chưa nên mở bán công khai ngay với cấu hình hiện tại.** Cần hoàn tất các điều kiện trong [DEPLOYMENT.md](DEPLOYMENT.md), rồi nghiệm thu staging trên domain thật.

## Bằng chứng kiểm thử

| Hạng mục | Kết quả |
| --- | --- |
| Build production | Qua; JS đầu vào giảm từ khoảng 746 KB xuống 386 KB nhờ tách biểu đồ báo cáo tải khi cần |
| Lint | Exit 0; còn 10 cảnh báo React effects/Fast Refresh, không phải lỗi build |
| Backend unit tests | 3/3 qua: mất kết nối, chặn số lượng sai trước DB, rollback lỗi vẫn release |
| API và trình duyệt Chrome | 16 nhóm kiểm tra qua, chi tiết `qa/artifacts/results.json` |
| Public routes | Trang chủ, menu, chi tiết, giỏ, checkout, giới thiệu, liên hệ, login, 404 ở 1440/390/320 px; không tràn ngang toàn trang |
| Luồng khách | Thêm giỏ, giữ giỏ sau reload, đặt COD thành công, giỏ lưu hỏng không gây crash |
| Admin | Login; các màn dashboard/món/danh mục/đơn/báo cáo trên desktop/mobile; bỏ lọc báo cáo đúng |
| API quản trị | CRUD món/danh mục, upload và đọc ảnh, cập nhật trạng thái, doanh thu; chặn anonymous |
| Toàn vẹn đơn | Giá lấy từ DB; chặn số lượng âm/0/lẻ/quá giới hạn, món trùng, món ngừng bán và phương thức thanh toán chưa hỗ trợ; đơn lỗi rollback |
| Mất API | Menu hiển thị thông báo lỗi thay vì báo không tìm thấy món |
| Dữ liệu local hiện có | Chỉ đọc: 14 món, 8 đơn; trang chủ/menu desktop và 390 px không có ảnh hỏng hoặc lỗi JavaScript |
| Dependency audit trực tiếp registry | Backend và frontend không còn cảnh báo ở thời điểm chạy; đã cập nhật bản vá qs/Express |

Kiểm thử ghi dữ liệu dùng schema QA riêng, tự dọn sau chạy. Không sửa/xóa các đơn hiện có. Dữ liệu mẫu QA dùng để kiểm tra admin, không phải ảnh chụp khách thật.

## Các lỗi đã sửa

- API đặt hàng từng nhận số lượng âm và tự đổi số lượng lỗi thành 1; bổ sung kiểm tra dữ liệu và giới hạn kích thước đơn.
- Lấy connection ngoài try/catch, release hai lần khi validation lỗi và truy vấn pool sau khi commit có thể làm phản hồi thất bại dù đơn đã lưu. Đã chuyển vào cùng connection/transaction và đảm bảo release một lần.
- Bỏ tùy chọn MoMo/chuyển khoản chưa có tích hợp; chỉ nhận COD cả frontend và backend.
- Bỏ công khai tài khoản/mật khẩu mẫu trên trang login; chặn tài khoản staff vào luồng admin gây redirect lặp.
- Thêm rate limit đăng nhập/đặt đơn và security headers; không trả lỗi SQL nội bộ ra client; production kiểm tra khóa JWT và URL HTTPS.
- Siết loại file upload và validation giá/tên sản phẩm, tên danh mục, kiểu dữ liệu đăng nhập.
- Navbar dễ đọc trên nền banner; giỏ hàng co giãn ở mobile; phần admin không làm tràn toàn trang; thẻ món ngừng bán không còn thêm được vào giỏ.
- Giỏ localStorage sai cấu trúc không làm crash; giới hạn 99 mỗi món; xử lý trường hợp trình duyệt không cho lưu storage.
- Sửa URL ảnh cố định localhost ở component form; API có timeout và fallback cùng origin; thêm proxy Vite cho local.
- Sửa nút xóa lọc báo cáo dùng state cũ; hiện thông báo khi tải dữ liệu thất bại trên các trang chính/admin.
- Thêm gitignore cấp dự án và file env mẫu frontend; không commit secret hoặc ảnh kiểm thử.

## Các điểm chưa đạt để mở bán

1. **Admin đang dùng mật khẩu mặc định và JWT là khóa mẫu.** Đây là kiểm tra trực tiếp local; chưa tự ý đổi credential. Có script `npm run admin:password` và hướng dẫn đổi khóa trong DEPLOYMENT.md.
2. **Chưa có idempotency cho đặt hàng.** Khi server đã lưu nhưng phản hồi bị mất, retry có thể tạo đơn trùng. Nút disabled trong UI và rate limit không giải quyết hoàn toàn trường hợp này.
3. **Chưa có cấu hình hosting thực tế.** Cần domain HTTPS, CORS, API URL build-time, SPA fallback, MySQL backup/TLS theo nhà cung cấp, persistent uploads và monitoring.
4. **Thông tin vận hành còn mẫu.** Contact/Footer chứa địa chỉ/số điện thoại mẫu, liên kết mạng xã hội `#`; About sơ sài, ảnh không gian lặp, đánh giá đang hardcode. Cần nội dung được chủ quán xác nhận.
5. **Quy trình nhận đơn còn cơ bản.** Chưa có thông báo đơn mới realtime, phí/khu vực giao hàng, giờ nhận đơn hoặc tra cứu đơn của khách. Danh sách admin chưa phân trang. Trạng thái đơn cho phép đổi tự do; chưa có lịch sử người đổi hoặc kiểm soát chuyển trạng thái khi nhiều nhân viên thao tác đồng thời.

## Nhận xét giao diện

Màu nâu/kem và bố cục thống nhất, phù hợp website quán cà phê. Các trang khách sử dụng được trên màn nhỏ; bảng admin có cuộn ngang bên trong. Tên món dài bị rút gọn trên thẻ, người mua cần mở chi tiết để đọc đủ. Trang giới thiệu/liên hệ hiện khá trống. Chưa kiểm tra đầy đủ accessibility bằng bàn phím/screen reader hoặc Safari/iOS thật.

Ảnh thực tế: `qa/artifacts/catalog-1440-home.png`, `catalog-390-menu.png`. Các ảnh `1440-_admin_*.png` và `390-_admin_*.png` sử dụng dữ liệu QA.

## Phạm vi còn chưa kiểm chứng

Chưa deploy, chưa load test, chưa kiểm tra backup/restore, HTTPS/CORS qua hạ tầng thật, lỗi mạng sau commit hoặc mọi trường hợp tấn công. Browser QA chạy giao diện Vite với API được chuyển sang backend QA; build production được kiểm tra riêng. Không coi kết quả này là chứng nhận web hoàn toàn an toàn hoặc không còn lỗi.
