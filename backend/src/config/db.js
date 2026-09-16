const mysql = require('mysql2/promise');
require('dotenv').config();

const ssl = process.env.DB_SSL === 'true' ? { minVersion: 'TLSv1.2' } : undefined;

// Tạo connection pool - giúp quản lý nhiều kết nối MySQL hiệu quả
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'coffee_shop',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  ssl,
});

// Hàm kiểm tra kết nối khi khởi động server
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Kết nối MySQL thành công!');
    connection.release();
  } catch (error) {
    console.error('❌ Không thể kết nối MySQL:', error.message);
    console.error('   Kiểm tra lại file .env và đảm bảo MySQL đang chạy.');
    process.exit(1);
  }
}

module.exports = { pool, testConnection };
