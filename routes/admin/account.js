const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const AdminAccountController = require('../../controllers/admin/account');

// 获取账户信息
router.get('/', authMiddleware, AdminAccountController.getAccount);

// 修改账户信息
router.put('/', authMiddleware, AdminAccountController.updateAccount);

module.exports = router;