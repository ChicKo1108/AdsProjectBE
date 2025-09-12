const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// 登录接口
router.post('/login', AuthController.login);

// 注册接口
router.post('/register', AuthController.register);

module.exports = router;