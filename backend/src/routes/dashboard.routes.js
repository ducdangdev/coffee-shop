const express = require('express');
const router = express.Router();
const { getStats, getReport } = require('../controllers/dashboard.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');

router.get('/stats', verifyToken, requireAdmin, getStats);
router.get('/report', verifyToken, requireAdmin, getReport);

module.exports = router;
