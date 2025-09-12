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

// 删除广告计划
router.delete('/:id', authMiddleware, AdminAdPlanController.deleteAdPlan);

// 删除广告组
router.delete('/:id/ad-groups', authMiddleware, AdminAdPlanController.deleteAdGroups);

module.exports = router;