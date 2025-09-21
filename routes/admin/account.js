const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const { requireSuperAdmin, requireSuperAdminOrAccountPermission } = require('../../middleware/permissionMiddleware');
const AdminAccountController = require('../../controllers/admin/account');

// 获取账户信息 - 所有认证用户都可以查看
router.get('/', authMiddleware, AdminAccountController.getAccount);

// 获取所有账户列表 - 只有超级管理员可以查看
router.get('/list', authMiddleware, requireSuperAdmin, AdminAccountController.getAccountList);

// 创建账户 - 只有超级管理员可以创建
router.post('/', authMiddleware, requireSuperAdmin, AdminAccountController.createAccount);

// 根据accountId获取特定账户信息 - 所有认证用户都可以查看
router.get('/:accountId', authMiddleware, AdminAccountController.getAccount);

// 修改账户信息 - 超级管理员或账户管理员可以修改
router.put('/:id', authMiddleware, requireSuperAdminOrAccountPermission('site_admin'), AdminAccountController.updateAccount);

module.exports = router;