const express = require('express');
const router = express.Router();
const AdPlanController = require('../controllers/adPlan');
const authMiddleware = require('../middleware/authMiddleware');
const { requireSuperAdminOrAccountPermission } = require('../middleware/permissionMiddleware');

// 获取广告计划列表 - 需要账户操作员权限
router.get('/', authMiddleware, requireSuperAdminOrAccountPermission('ad_operator'), AdPlanController.getAdPlanList);

// 获取广告组列表 - 需要账户操作员权限
router.get('/ad-groups', authMiddleware, requireSuperAdminOrAccountPermission('ad_operator'), AdPlanController.getAdGroupList);

// 获取广告计划详情 - 需要账户操作员权限
router.get('/:id', authMiddleware, requireSuperAdminOrAccountPermission('ad_operator'), AdPlanController.getAdPlanDetail);


module.exports = router;