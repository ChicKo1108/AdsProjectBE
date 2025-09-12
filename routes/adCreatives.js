const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const AdCreativesController = require('../controllers/adCreatives');

// 获取广告创意列表
router.get('/', authMiddleware, AdCreativesController.getAdCreativesList);

// 获取广告创意详情
router.get('/:id', authMiddleware, AdCreativesController.getAdCreativesDetail);

module.exports = router;