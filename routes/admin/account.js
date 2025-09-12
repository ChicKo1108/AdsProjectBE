const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const AdminAccountController = require('../../controllers/admin/account');

// 修改账户信息
router.put('/', authMiddleware, AdminAccountController.updateAccount);

module.exports = router;