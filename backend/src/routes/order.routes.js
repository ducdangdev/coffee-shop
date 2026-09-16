const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/order.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');

// Public - khách đặt hàng
router.post('/', createOrder);

// Admin only - quản lý đơn hàng
router.get('/', verifyToken, requireAdmin, getOrders);
router.get('/:id', verifyToken, requireAdmin, getOrderById);
router.put('/:id/status', verifyToken, requireAdmin, updateOrderStatus);

module.exports = router;
