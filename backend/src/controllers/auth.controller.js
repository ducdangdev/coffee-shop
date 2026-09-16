const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

/**
 * POST /api/auth/login
 * Đăng nhập bằng email + password, trả về JWT token.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || !email.trim() || email.length > 100 ||
        typeof password !== 'string' || !password || password.length > 200) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.trim()]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch || user.role !== 'admin') {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Đăng nhập thành công.',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Lấy thông tin người dùng đang đăng nhập (dựa vào token).
 */
async function getMe(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, full_name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
}

module.exports = { login, getMe };
