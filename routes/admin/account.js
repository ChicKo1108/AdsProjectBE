const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const AdminAccountController = require('../../controllers/admin/account');

// 获取账户信息 - 所有认证用户都可以查看
router.get('/', authMiddleware, AdminAccountController.getAccount);

// 根据accountId获取特定账户信息 - 所有认证用户都可以查看
router.get('/:accountId', authMiddleware, AdminAccountController.getAccount);

// 修改账户信息 - 超级管理员或账户管理员可以修改
router.put('/', authMiddleware, AdminAccountController.updateAccount);

module.exports = router;