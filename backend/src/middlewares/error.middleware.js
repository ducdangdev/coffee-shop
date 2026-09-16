/**
 * Middleware xử lý lỗi tập trung.
 * Đặt ở cuối cùng trong server.js (sau tất cả routes).
 */
function errorHandler(err, req, res, next) {
  console.error('❌ Lỗi:', err.message);

  // Lỗi từ multer (upload ảnh)
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: `Lỗi upload file: ${err.message}` });
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    message: statusCode >= 500 ? 'Đã xảy ra lỗi trên server. Vui lòng thử lại sau.' : err.message,
  });
}

// Middleware xử lý route không tồn tại
function notFound(req, res, next) {
  res.status(404).json({ message: `Không tìm thấy route: ${req.originalUrl}` });
}

module.exports = { errorHandler, notFound };
