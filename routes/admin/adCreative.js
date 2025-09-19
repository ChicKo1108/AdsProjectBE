const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const { requireSuperAdminOrAccountPermission } = require('../../middleware/permissionMiddleware');
const AdminAdCreativeController = require('../../controllers/admin/adCreative');

// 创建广告创意 - 需要账户管理员权限
router.post('/', authMiddleware, requireSuperAdminOrAccountPermission('site_admin'), AdminAdCreativeController.createAdCreative);

// 修改广告创意 - 需要账户管理员权限
router.put('/:id', authMiddleware, requireSuperAdminOrAccountPermission('site_admin'), AdminAdCreativeController.updateAdCreative);

// 删除广告创意 - 需要账户管理员权限
router.delete('/:id', authMiddleware, requireSuperAdminOrAccountPermission('site_admin'), AdminAdCreativeController.deleteAdCreative);

module.exports = router;