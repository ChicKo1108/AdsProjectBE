const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const { requireSuperAdmin } = require('../../middleware/permissionMiddleware');
const AdminUserController = require('../../controllers/admin/users');

// 创建用户 - 只有超级管理员可以创建用户
router.post('/', authMiddleware, requireSuperAdmin, AdminUserController.createUser);

// 获取用户列表 - 只有超级管理员可以查看用户列表
router.get('/', authMiddleware, requireSuperAdmin, AdminUserController.getUserList);

// 修改用户 - 只有超级管理员可以修改用户
router.put('/:id', authMiddleware, requireSuperAdmin, AdminUserController.updateUser);

// 获取用户的账户绑定信息 - 只有超级管理员可以查看
router.get('/:id/accounts', authMiddleware, requireSuperAdmin, AdminUserController.getUserAccounts);

// 绑定用户到账户 - 只有超级管理员可以操作
router.post('/:id/accounts', authMiddleware, requireSuperAdmin, AdminUserController.bindUserAccount);

// 解绑用户账户 - 只有超级管理员可以操作
router.delete('/:id/accounts', authMiddleware, requireSuperAdmin, AdminUserController.unbindUserAccount);

// 更新用户账户权限 - 只有超级管理员可以操作
router.put('/:id/accounts', authMiddleware, requireSuperAdmin, AdminUserController.updateUserAccountRole);

module.exports = router;