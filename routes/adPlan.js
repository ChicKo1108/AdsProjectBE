const express = require('express');
const router = express.Router();
const AdPlanController = require('../controllers/adPlan');
const authMiddleware = require('../middleware/authMiddleware');

// 获取广告计划列表
router.get('/', authMiddleware, AdPlanController.getAdPlanList);

// 获取广告计划详情
router.get('/:id', authMiddleware, AdPlanController.getAdPlanDetail);

// 获取广告组列表
router.get('/ad-groups', authMiddleware, AdPlanController.getAdGroupList);

module.exports = router;