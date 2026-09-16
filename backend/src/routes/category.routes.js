const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');

// Public
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin only
router.post('/', verifyToken, requireAdmin, createCategory);
router.put('/:id', verifyToken, requireAdmin, updateCategory);
router.delete('/:id', verifyToken, requireAdmin, deleteCategory);

module.exports = router;
