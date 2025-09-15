const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth');

// 登录接口
router.post('/login', AuthController.login);

// 注册接口
router.post('/register', AuthController.register);

// 验证token接口
router.post('/validate-token', AuthController.validateToken);

// 修改姓名接口
router.post('/update-name', AuthController.updateName);

// 修改密码接口
router.post('/update-password', AuthController.updatePassword);

module.exports = router;