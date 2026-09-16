const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Public
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin only
router.post('/', verifyToken, requireAdmin, upload.single('image'), createProduct);
router.put('/:id', verifyToken, requireAdmin, upload.single('image'), updateProduct);
router.delete('/:id', verifyToken, requireAdmin, deleteProduct);

module.exports = router;
