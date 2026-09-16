require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');

const { testConnection } = require('./config/db');
const { errorHandler, notFound } = require('./middlewares/error.middleware');

const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();
app.disable('x-powered-by');
if (process.env.TRUST_PROXY_HOPS) app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
if (process.env.NODE_ENV === 'production' &&
    (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || /change_this|super_secret|your_secret/i.test(process.env.JWT_SECRET) ||
     !process.env.CLIENT_URL || !process.env.CLIENT_URL.startsWith('https://'))) {
  throw new Error('Production requires a strong JWT_SECRET and an HTTPS CLIENT_URL.');
}

// ============================================
// Middlewares chung
// ============================================
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  })
);
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: true }));

// Cho phép truy cập ảnh đã upload qua URL: http://localhost:5000/uploads/ten-file.jpg
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ============================================
// Route kiểm tra server sống
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Coffee Shop API đang hoạt động 🚀' });
});
app.get('/api/ready', async (req, res) => {
  try {
    await require('./config/db').pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'unavailable' });
  }
});
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false,
  message: { message: 'Đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút.' },
}));
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false,
  message: { message: 'Bạn gửi quá nhiều yêu cầu đặt hàng. Vui lòng thử lại sau.' },
});
app.use('/api/orders', (req, res, next) => req.method === 'POST' ? orderLimiter(req, res, next) : next());

// ============================================
// Routes chính
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ============================================
// Xử lý lỗi
// ============================================
app.use(notFound);
app.use(errorHandler);

// ============================================
// Khởi động server
// ============================================
const PORT = process.env.PORT || 5000;

async function startServer() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
  });
}

startServer();
