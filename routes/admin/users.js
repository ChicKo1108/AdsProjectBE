const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const AdminUserController = require('../../controllers/admin/users');

// 创建用户
router.post('/', authMiddleware, AdminUserController.createUser);

// 获取用户列表
router.get('/', authMiddleware, AdminUserController.getUserList);

// 修改用户
router.put('/:id', authMiddleware, AdminUserController.updateUser);

module.exports = router;