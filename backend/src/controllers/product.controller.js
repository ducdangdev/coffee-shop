const { pool } = require('../config/db');

function validProduct(body, partial = false) {
  if ((!partial || body.name !== undefined) &&
      (typeof body.name !== 'string' || !body.name.trim() || body.name.length > 150)) return false;
  if ((!partial || body.category_id !== undefined) &&
      (!Number.isSafeInteger(Number(body.category_id)) || Number(body.category_id) < 1)) return false;
  if ((!partial || body.price !== undefined) &&
      (!['string', 'number'].includes(typeof body.price) || !Number.isFinite(Number(body.price)) ||
       Number(body.price) <= 0 || Number(body.price) > 99999999.99)) return false;
  return true;
}

function toSlug(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * GET /api/products
 * Lấy danh sách sản phẩm (public).
 * Hỗ trợ query params: search, category, featured
 * Ví dụ: /api/products?search=ca+phe&category=1&featured=true
 */
async function getProducts(req, res, next) {
  try {
    const { search, category, featured } = req.query;

    let sql = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 1 = 1
    `;
    const params = [];

    if (search) {
      sql += ' AND p.name LIKE ?';
      params.push(`%${search}%`);
    }

    if (category) {
      sql += ' AND p.category_id = ?';
      params.push(category);
    }

    if (featured === 'true') {
      sql += ' AND p.is_featured = 1';
    }

    sql += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/products/:id
 */
async function getProductById(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
    }

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/products
 * Tạo sản phẩm mới (Admin). Hỗ trợ upload ảnh (multipart/form-data, field "image").
 */
async function createProduct(req, res, next) {
  try {
    const { category_id, name, description, price, is_featured, is_available } = req.body;

    if (!validProduct(req.body)) {
      return res.status(400).json({ message: 'Danh mục, tên và giá là bắt buộc.' });
    }

    const slug = toSlug(name) + '-' + Date.now().toString().slice(-5);
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image_url || null;

    const [result] = await pool.query(
      `INSERT INTO products
        (category_id, name, slug, description, price, image_url, is_featured, is_available)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id,
        name,
        slug,
        description || null,
        price,
        imageUrl,
        is_featured === 'true' || is_featured === true ? 1 : 0,
        is_available === 'false' || is_available === false ? 0 : 1,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/products/:id
 * Cập nhật sản phẩm (Admin).
 */
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { category_id, name, description, price, is_featured, is_available } = req.body;

    if (!validProduct(req.body, true)) {
      return res.status(400).json({ message: 'Tên, danh mục hoặc giá sản phẩm không hợp lệ.' });
    }

    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
    }

    const current = existing[0];
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image_url ?? current.image_url;

    await pool.query(
      `UPDATE products SET
        category_id = ?, name = ?, description = ?, price = ?,
        image_url = ?, is_featured = ?, is_available = ?
       WHERE id = ?`,
      [
        category_id || current.category_id,
        name || current.name,
        description ?? current.description,
        price ?? current.price,
        imageUrl,
        is_featured !== undefined ? (is_featured === 'true' || is_featured === true ? 1 : 0) : current.is_featured,
        is_available !== undefined ? (is_available === 'false' || is_available === false ? 0 : 1) : current.is_available,
        id,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/products/:id
 * Xóa sản phẩm (Admin).
 */
async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
    }

    res.json({ message: 'Xóa sản phẩm thành công.' });
  } catch (error) {
    // Nếu sản phẩm đã từng được đặt hàng (order_items tham chiếu tới),
    // xóa sẽ bị chặn bởi khóa ngoại (ON DELETE RESTRICT)
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        message: 'Không thể xóa vì sản phẩm đã có trong đơn hàng. Hãy ẩn sản phẩm (is_available) thay vì xóa.',
      });
    }
    next(error);
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
