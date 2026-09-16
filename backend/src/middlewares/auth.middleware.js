const jwt = require('jsonwebtoken');

/**
 * Middleware kiểm tra người dùng đã đăng nhập chưa (có JWT hợp lệ không).
 * Token được gửi qua header: Authorization: Bearer <token>
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Không tìm thấy token xác thực.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
}

/**
 * Middleware kiểm tra quyền Admin.
 * Phải dùng SAU verifyToken.
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này.' });
  }
  next();
}

module.exports = { verifyToken, requireAdmin };
