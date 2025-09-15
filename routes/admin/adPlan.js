const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const AdminAdPlanController = require('../../controllers/admin/adPlan');

// 新建广告计划
router.post('/', authMiddleware, AdminAdPlanController.createAdPlan);

// 修改广告计划
router.put('/:id', authMiddleware, AdminAdPlanController.updateAdPlan);

// 绑定广告组
router.post('/:id/ad-groups', authMiddleware, AdminAdPlanController.bindAdGroups);

// 批量绑定广告计划到广告组
router.post('/bind', authMiddleware, AdminAdPlanController.batchBindAdPlansToAdGroups);

// 解绑广告计划
router.delete('/bind', authMiddleware, AdminAdPlanController.unbindAdPlan);

// 删除广告计划
router.delete('/:id', authMiddleware, AdminAdPlanController.deleteAdPlan);

// 删除广告组
router.delete('/ad-groups/:id', authMiddleware, AdminAdPlanController.deleteAdGroup);

// 新建广告组
router.post('/ad-groups', authMiddleware, AdminAdPlanController.createAdGroup);

// 修改广告组
router.put('/ad-groups/:id', authMiddleware, AdminAdPlanController.updateAdGroup);

module.exports = router;