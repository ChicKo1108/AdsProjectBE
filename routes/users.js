const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');
const authMiddleware = require('../middleware/authMiddleware');

/* GET users listing. */
router.get('/', authMiddleware, UserController.showUser);

module.exports = router;
