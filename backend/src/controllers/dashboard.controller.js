const { pool } = require('../config/db');

/**
 * GET /api/dashboard/stats
 * Thống kê tổng quan cho trang Dashboard Admin.
 */
async function getStats(req, res, next) {
  try {
    const [[{ total_revenue }]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS total_revenue
       FROM orders WHERE status = 'completed'`
    );

    const [[{ total_orders }]] = await pool.query('SELECT COUNT(*) AS total_orders FROM orders');
    const [[{ total_products }]] = await pool.query('SELECT COUNT(*) AS total_products FROM products');
    const [[{ new_orders }]] = await pool.query(
      "SELECT COUNT(*) AS new_orders FROM orders WHERE status = 'pending'"
    );

    const [recentOrders] = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT 5'
    );

    res.json({
      total_revenue,
      total_orders,
      total_products,
      new_orders,
      recent_orders: recentOrders,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/dashboard/report?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Báo cáo doanh thu, món bán chạy, doanh thu theo ngày.
 */
async function getReport(req, res, next) {
  try {
    const { from, to } = req.query;
    const dateFilter = from && to ? 'AND o.created_at BETWEEN ? AND ?' : '';
    const params = from && to ? [from, `${to} 23:59:59`] : [];

    const [[summary]] = await pool.query(
      `SELECT COALESCE(SUM(o.total_amount), 0) AS revenue, COUNT(*) AS order_count
       FROM orders o WHERE o.status = 'completed' ${dateFilter}`,
      params
    );

    const [topProducts] = await pool.query(
      `SELECT oi.product_id, oi.product_name, SUM(oi.quantity) AS total_sold, SUM(oi.subtotal) AS total_revenue
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.status = 'completed' ${dateFilter}
       GROUP BY oi.product_id, oi.product_name
       ORDER BY total_sold DESC
       LIMIT 10`,
      params
    );

    const [revenueByDay] = await pool.query(
      `SELECT DATE(o.created_at) AS date, SUM(o.total_amount) AS revenue, COUNT(*) AS order_count
       FROM orders o
       WHERE o.status = 'completed' ${dateFilter}
       GROUP BY DATE(o.created_at)
       ORDER BY date ASC`,
      params
    );

    res.json({ summary, top_products: topProducts, revenue_by_day: revenueByDay });
  } catch (error) {
    next(error);
  }
}

module.exports = { getStats, getReport };
