const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const logger = require('../logger');

// 登录路由
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 查找用户
    const user = await User.query().where({ username }).first();
    if (!user) {
      return res.status(400).json({ code: -1, success: false, message: '用户不存在', data: {} });
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ code: -1, success: false, message: '密码不正确', data: {} });
    }

    // 生成JWT
    const payload = { userId: user.id, username: user.username };
    const token = jwt.sign(payload, 'your_jwt_secret', { expiresIn: '1h' }); // 密钥应从环境变量中获取

    logger.info(`用户 ${username} 成功登录`);
    res.json({ code: 0, success: true, message: '登录成功', data: { token } });
  } catch (err) {
    logger.error(`登录失败: ${err.message}`);
    next(err);
  }
});

// 注册路由
router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.query().where({ username }).first();
    if (existingUser) {
      return res.status(400).json({ code: -1, success: false, message: '用户已存在', data: {} });
    }

    // 哈希密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建用户
    const newUser = await User.query().insert({
      username,
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date()
    });

    logger.info(`用户 ${username} 成功注册`);
    res.status(201).json({ code: 0, success: true, message: '注册成功', data: { userId: newUser.id } });
  } catch (err) {
    logger.error(`注册失败: ${err.message}`);
    next(err);
  }
});

module.exports = router;