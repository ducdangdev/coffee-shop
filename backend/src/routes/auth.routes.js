const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/login', login);
router.get('/me', verifyToken, getMe);

module.exports = router;
