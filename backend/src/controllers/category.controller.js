const { pool } = require('../config/db');

// Chuyển tên món thành slug (không dấu, gạch ngang) để dùng trong URL
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
 * GET /api/categories
 * Lấy danh sách tất cả danh mục (public).
 */
async function getCategories(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/categories/:id
 */
async function getCategoryById(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục.' });
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/categories
 * Tạo danh mục mới (Admin).
 */
async function createCategory(req, res, next) {
  try {
    const { name, description } = req.body;

    if (typeof name !== 'string' || !name.trim() || name.length > 100) {
      return res.status(400).json({ message: 'Tên danh mục là bắt buộc.' });
    }

    const slug = toSlug(name);

    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
      [name, slug, description || null]
    );

    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Danh mục này đã tồn tại.' });
    }
    next(error);
  }
}

/**
 * PUT /api/categories/:id
 * Cập nhật danh mục (Admin).
 */
async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (name !== undefined && (typeof name !== 'string' || !name.trim() || name.length > 100)) {
      return res.status(400).json({ message: 'Tên danh mục không hợp lệ.' });
    }

    const [existing] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục.' });
    }

    const slug = name ? toSlug(name) : existing[0].slug;

    await pool.query(
      'UPDATE categories SET name = ?, slug = ?, description = ? WHERE id = ?',
      [name || existing[0].name, slug, description ?? existing[0].description, id]
    );

    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Tên danh mục này đã tồn tại.' });
    }
    next(error);
  }
}

/**
 * DELETE /api/categories/:id
 * Xóa danh mục (Admin). Không cho xóa nếu còn sản phẩm thuộc danh mục.
 */
async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;

    const [products] = await pool.query('SELECT id FROM products WHERE category_id = ? LIMIT 1', [id]);
    if (products.length > 0) {
      return res.status(400).json({
        message: 'Không thể xóa danh mục vì vẫn còn sản phẩm thuộc danh mục này.',
      });
    }

    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục.' });
    }

    res.json({ message: 'Xóa danh mục thành công.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
