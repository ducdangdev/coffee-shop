const { pool } = require('../config/db');

const VALID_STATUSES = ['pending', 'preparing', 'delivering', 'completed', 'cancelled'];

/**
 * POST /api/orders
 * Khách đặt hàng (public). Dùng transaction để đảm bảo toàn vẹn dữ liệu:
 * - Tạo order
 * - Tạo từng order_item, lấy giá THẬT từ DB (không tin giá client gửi lên)
 * - Cập nhật lại tổng tiền chính xác
 *
 * Body mẫu:
 * {
 *   "customer_name": "Nguyễn Văn A",
 *   "customer_phone": "0901234567",
 *   "customer_address": "123 ...",
 *   "note": "Ít đá",
 *   "payment_method": "cod",
 *   "items": [ { "product_id": 1, "quantity": 2 }, { "product_id": 3, "quantity": 1 } ]
 * }
 */
async function createOrder(req, res, next) {
  let connection;
  let committed = false;

  try {
    const { customer_name, customer_phone, customer_address, note, payment_method, items } = req.body;

    if (typeof customer_name !== 'string' || !customer_name.trim() || customer_name.length > 100 ||
        typeof customer_phone !== 'string' || !/^[0-9]{9,11}$/.test(customer_phone.trim()) ||
        typeof customer_address !== 'string' || !customer_address.trim() || customer_address.length > 255 ||
        (note != null && (typeof note !== 'string' || note.length > 255))) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ họ tên, số điện thoại, địa chỉ.' });
    }

    if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
      return res.status(400).json({ message: 'Giỏ hàng đang trống.' });
    }

    if (items.some(item => !item || !Number.isSafeInteger(item.product_id) || item.product_id < 1 ||
        !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) ||
        new Set(items.map(item => item.product_id)).size !== items.length) {
      return res.status(400).json({ message: 'Mỗi món phải có số lượng nguyên từ 1 đến 99 và không được trùng lặp.' });
    }
    if (payment_method && payment_method !== 'cod') {
      return res.status(400).json({ message: 'Hiện chỉ hỗ trợ thanh toán khi nhận hàng (COD).' });
    }
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Tạo order trước với total_amount = 0 (sẽ cập nhật sau)
    const [orderResult] = await connection.query(
      `INSERT INTO orders
        (customer_name, customer_phone, customer_address, note, payment_method, status, total_amount)
       VALUES (?, ?, ?, ?, ?, 'pending', 0)`,
      [customer_name.trim(), customer_phone.trim(), customer_address.trim(), note?.trim() || null, 'cod']
    );

    const orderId = orderResult.insertId;
    let totalAmount = 0;

    for (const item of items) {
      const [productRows] = await connection.query(
        'SELECT id, name, price, is_available FROM products WHERE id = ? FOR UPDATE',
        [item.product_id]
      );

      if (productRows.length === 0) {
        throw Object.assign(new Error(`Sản phẩm ID ${item.product_id} không tồn tại.`), { statusCode: 400 });
      }

      const product = productRows[0];

      if (!product.is_available) {
        throw Object.assign(new Error(`Sản phẩm "${product.name}" hiện đã ngừng bán.`), { statusCode: 400 });
      }

      const quantity = item.quantity;
      const subtotal = Number(product.price) * quantity;
      totalAmount += subtotal;
      if (!Number.isFinite(totalAmount) || Number(product.price) <= 0 || totalAmount > 99999999.99) {
        throw Object.assign(new Error('Giá trị đơn hàng không hợp lệ.'), { statusCode: 400 });
      }

      await connection.query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, product.id, product.name, product.price, quantity, subtotal]
      );
    }

    await connection.query('UPDATE orders SET total_amount = ? WHERE id = ?', [totalAmount, orderId]);

    const [orderRows] = await connection.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const [itemRows] = await connection.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    await connection.commit();
    committed = true;

    res.status(201).json({ ...orderRows[0], items: itemRows });
  } catch (error) {
    if (connection && !committed) {
      try { await connection.rollback(); } catch (rollbackError) { console.error('Rollback failed:', rollbackError.code); }
    }
    next(error);
  } finally {
    connection?.release();
  }
}

/**
 * GET /api/orders
 * Lấy danh sách đơn hàng (Admin). Hỗ trợ lọc theo status: ?status=pending
 */
async function getOrders(req, res, next) {
  try {
    const { status } = req.query;

    let sql = 'SELECT * FROM orders';
    const params = [];

    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/orders/:id
 * Chi tiết đơn hàng kèm danh sách món (Admin, hoặc khách tra cứu đơn của mình).
 */
async function getOrderById(req, res, next) {
  try {
    const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);

    if (orderRows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }

    const [itemRows] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);

    res.json({ ...orderRows[0], items: itemRows });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/orders/:id/status
 * Cập nhật trạng thái đơn hàng (Admin).
 * Body: { "status": "preparing" }
 */
async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Trạng thái không hợp lệ. Chỉ chấp nhận: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }

    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
}

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus };
