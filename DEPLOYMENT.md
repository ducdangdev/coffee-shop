# Chuẩn bị vận hành

Chưa deploy công khai hoặc thay đổi mật khẩu/khóa JWT trong lần kiểm tra này. Chưa chọn nền tảng hosting.

## Điều kiện cần hoàn tất

1. Đổi mật khẩu admin hiện có: kiểm tra local xác nhận vẫn dùng mật khẩu seed. Đã bỏ phần công khai tài khoản mẫu khỏi màn hình đăng nhập, nhưng việc đó không đổi mật khẩu database.
2. Thay JWT_SECRET mẫu bằng giá trị ngẫu nhiên riêng cho production. Có thể tạo bằng `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. Lưu trong secret manager của hosting, không commit. Đổi khóa sẽ vô hiệu hóa token cũ.
3. Thay địa chỉ/số điện thoại mẫu trong Contact/Footer; thay các liên kết `#` bằng kênh thật; xác nhận nội dung giới thiệu, đánh giá và hình ảnh trước công khai.
4. Chốt khu vực giao hàng, phí giao hàng, giờ nhận đơn và cách nhân viên xác nhận đơn. Hiện tổng đơn chỉ gồm giá món, chưa có phí giao hàng. Chỉ COD được bật; MoMo/chuyển khoản chưa tích hợp.
5. Có MySQL production riêng, user quyền tối thiểu, backup tự động và thử khôi phục. Không import seed thử nghiệm vào database có đơn thật. File schema hiện tạo database `coffee_shop`; hosting cấp tên khác thì điều chỉnh `CREATE DATABASE`/`USE` khi nhập schema.
6. Lưu `backend/uploads` trên ổ persistent hoặc chuyển sang object storage. Thư mục này không được đưa vào Git; cần chuyển cả ảnh hiện có khi chuyển database. Redeploy trên filesystem tạm có thể làm mất ảnh.

## Đổi mật khẩu admin hiện có

Chạy trong thư mục backend, với biến DB trỏ đúng database cần đổi. Script chỉ cập nhật admin đã tồn tại, không tạo tài khoản mới. Trong PowerShell:

```powershell
$env:ADMIN_EMAIL = Read-Host 'Email admin'
$adminSecret = Read-Host 'Mật khẩu mới (ít nhất 12 ký tự)' -AsSecureString
$env:ADMIN_NEW_PASSWORD = [System.Net.NetworkCredential]::new('', $adminSecret).Password
try { npm run admin:password } finally { Remove-Item Env:ADMIN_NEW_PASSWORD; Remove-Item Env:ADMIN_EMAIL }
```

Sau đó thay JWT_SECRET và restart backend. Không chạy lệnh này trên production nếu chưa xác nhận đúng cấu hình DB.

## Backend

- Root directory: `backend`; dùng Node 24 (phiên bản local đã kiểm thử: 24.13.0).
- Cài dependency: `npm ci --omit=dev`; start: `npm start`.
- Environment: `NODE_ENV=production`, `PORT` do hosting cung cấp, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL=https://ten-mien-frontend` (không thêm slash cuối).
- Nếu hosting có reverse proxy, đặt `TRUST_PROXY_HOPS` bằng đúng số proxy tin cậy; không đoán giá trị này. Rate limit hiện lưu trong bộ nhớ một process; nhiều replica cần shared store.
- Backend chủ động từ chối khởi động production nếu JWT còn giống khóa mẫu hoặc CLIENT_URL không dùng HTTPS.
- Liveness `/api/health`; readiness `/api/ready` kiểm tra MySQL và trả 503 khi DB lỗi.
- Đảm bảo HTTPS, process tự khởi động lại khi crash, log/monitoring và cảnh báo mất kết nối DB. Nếu DB yêu cầu TLS, cấu hình thêm TLS của mysql2 theo nhà cung cấp trước deploy; code hiện chưa cấu hình TLS.

## Frontend

- Root directory: `frontend`; install: `npm ci`; build: `npm run build`; output: `dist`.
- Đặt `VITE_API_URL=https://ten-mien-backend/api` **trước build** khi tách frontend/backend. Biến VITE được nhúng công khai, tuyệt đối không chứa secret.
- Khi dùng chung tên miền, có thể dùng `VITE_API_URL=/api`; reverse proxy phải chuyển `/api` và `/uploads` sang backend.
- Cấu hình SPA fallback: URL frontend như `/menu`, `/product/1`, `/admin/orders` trả `index.html` khi refresh. Không rewrite API hoặc file upload thành index.html.
- `.env` local đang trỏ localhost; không dùng nguyên bản này để build production mà không ghi đè VITE_API_URL.

## Nghiệm thu trên staging trước mở bán

- Chạy lại kiểm tra tìm/lọc món, thêm giỏ, tải lại giỏ, đặt COD, đăng nhập, upload ảnh, xem đơn, cập nhật trạng thái và báo cáo trên domain HTTPS thật.
- Refresh trực tiếp các đường dẫn con; kiểm tra API/CORS và ảnh upload sau một lần redeploy.
- Kiểm tra tài khoản cũ/khóa cũ không dùng được sau đổi cấu hình.
- Chạy đơn thử có kiểm soát từ điện thoại thật và kiểm tra nhân viên nhận/xử lý được. Chưa có thông báo đơn realtime; hiện nhân viên phải tải lại danh sách.
- API chưa có idempotency key: nếu mất mạng sau khi server lưu đơn, khách thử lại có thể tạo đơn trùng. Cần bổ sung cơ chế chống trùng trước khi mở bán rộng, hoặc có quy trình xác nhận/đối soát chặt trong giai đoạn thử nghiệm.
- Chưa thực hiện load test, thử restore backup, kiểm tra Safari/iOS thật hoặc thanh toán online; kết quả local không thay thế các bước này.

## Chạy lại kiểm thử local

```powershell
# Tại thư mục gốc
npm install --no-save --package-lock=false --prefix .qa-tools playwright
# Terminal khác: cd frontend; npm run dev -- --host 127.0.0.1
node qa/check.cjs
node qa/catalog.cjs
# Trong backend
npm test
# Trong frontend
npm run build
npm run lint
```

`qa/check.cjs` dùng Chrome ở đường dẫn Windows trong script; tạo database `coffee_shop_qa_<timestamp>`, chạy backend port 5001, kiểm thử rồi xóa đúng database QA đó. Cần user MySQL local có quyền CREATE/DROP DATABASE. Không trỏ script này vào DB production. Request trình duyệt được chuyển sang backend QA; không ghi đơn vào database đang dùng. `qa/catalog.cjs` chỉ đọc catalog hiện tại qua localhost:5000. Ảnh và kết quả nằm trong `qa/artifacts/` và đã được gitignore.
