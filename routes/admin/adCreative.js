const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const AdminAdCreativeController = require('../../controllers/admin/adCreative');

// 创建广告创意
router.post('/', authMiddleware, AdminAdCreativeController.createAdCreative);

// 修改广告创意
router.put('/:id', authMiddleware, AdminAdCreativeController.updateAdCreative);

// 删除广告创意
router.delete('/:id', authMiddleware, AdminAdCreativeController.deleteAdCreative);

module.exports = router;