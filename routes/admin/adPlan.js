const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const { requireSuperAdminOrAccountPermission } = require('../../middleware/permissionMiddleware');
const AdminAdPlanController = require('../../controllers/admin/adPlan');

// 新建广告计划 - 需要账户管理员权限
router.post('/', authMiddleware, requireSuperAdminOrAccountPermission('site_admin'), AdminAdPlanController.createAdPlan);

// 修改广告计划 - 需要账户管理员权限
router.put('/:id', authMiddleware, requireSuperAdminOrAccountPermission('site_admin'), AdminAdPlanController.updateAdPlan);

// 绑定广告组 - 需要账户管理员权限
router.post('/:id/ad-groups', authMiddleware, requireSuperAdminOrAccountPermission('site_admin'), AdminAdPlanController.bindAdGroups);

// 批量绑定广告计划到广告组 - 需要账户管理员权限
router.post('/bind', authMiddleware, requireSuperAdminOrAccountPermission('site_admin'), AdminAdPlanController.batchBindAdPlansToAdGroups);

// 解绑广告计划 - 需要账户管理员权限
router.delete('/bind', authMiddleware, requireSuperAdminOrAccountPermission('site_admin'), AdminAdPlanController.unbindAdPlan);

// 删除广告计划 - 需要账户管理员权限
router.delete('/:id', authMiddleware, requireSuperAdminOrAccountPermission('site_admin'), AdminAdPlanController.deleteAdPlan);

// 删除广告组 - 需要账户管理员权限
router.delete('/ad-groups/:id', authMiddleware, requireSuperAdminOrAccountPermission('site_admin'), AdminAdPlanController.deleteAdGroup);

// 新建广告组 - 需要账户管理员权限
router.post('/ad-groups', authMiddleware, requireSuperAdminOrAccountPermission('site_admin'), AdminAdPlanController.createAdGroup);

// 修改广告组 - 需要账户管理员权限
router.put('/ad-groups/:id', authMiddleware, requireSuperAdminOrAccountPermission('site_admin'), AdminAdPlanController.updateAdGroup);

module.exports = router;