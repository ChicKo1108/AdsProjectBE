const express = require('express');
const router = express.Router();
const HomeController = require('../controllers/home');
const authMiddleware = require('../middleware/authMiddleware');

// 首页信息接口
router.get('/', authMiddleware, HomeController.getHomeInfo);

module.exports = router;