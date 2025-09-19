const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { requireSuperAdminOrAccountPermission } = require('../middleware/permissionMiddleware');
const AdCreativesController = require('../controllers/adCreatives');

// 获取广告创意列表 - 需要账户操作员权限
router.get('/', authMiddleware, requireSuperAdminOrAccountPermission('ad_operator'), AdCreativesController.getAdCreativesList);

// 获取广告创意详情 - 需要账户操作员权限
router.get('/:id', authMiddleware, requireSuperAdminOrAccountPermission('ad_operator'), AdCreativesController.getAdCreativesDetail);

module.exports = router;