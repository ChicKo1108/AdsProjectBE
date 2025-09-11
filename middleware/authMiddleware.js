const jwt = require('jsonwebtoken');
const logger = require('../logger');

const authMiddleware = (req, res, next) => {
  // 从请求头获取token
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    logger.warn('未提供认证令牌');
    return res.status(401).json({ code: -1, success: false, message: '未提供认证令牌', data: {} });
  }

  const token = authHeader.split(' ')[1]; // Bearer TOKEN
  if (!token) {
    logger.warn('认证令牌格式不正确');
    return res.status(401).json({ code: -1, success: false, message: '认证令牌格式不正确', data: {} });
  }

  try {
    // 验证token
    const decoded = jwt.verify(token, 'your_jwt_secret'); // 密钥应与生成JWT时使用的密钥一致
    req.user = decoded; // 将解码后的用户信息附加到请求对象
    next(); // 继续处理请求
  } catch (err) {
    logger.error(`JWT验证失败: ${err.message}`);
    res.status(401).json({ code: -1, success: false, message: '无效的认证令牌', data: {} });
  }
};

module.exports = authMiddleware;