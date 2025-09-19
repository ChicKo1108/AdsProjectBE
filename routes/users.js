const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');
const authMiddleware = require('../middleware/authMiddleware');

/* GET users listing. - 获取用户信息，只需要基本认证 */
router.get('/', authMiddleware, UserController.showUser);

/* GET user accounts - 获取用户可访问的账户列表 */
router.get('/accounts', authMiddleware, UserController.getUserAccounts);

module.exports = router;
