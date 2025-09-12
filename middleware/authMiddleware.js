const jwt = require('jsonwebtoken');
const logger = require('../logger');
const config = require('../config');

const JWT_SECRET = config.jwt.secret;

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
    const decoded = jwt.verify(token, JWT_SECRET); // 密钥应与生成JWT时使用的密钥一致
    
    // 检查是否需要续期（距离过期还有1天时自动续期）
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - now;
    const renewThreshold = 24 * 60 * 60; // 1天 = 24小时 * 60分钟 * 60秒
    
    if (timeUntilExpiry < renewThreshold && timeUntilExpiry > 0) {
      // 生成新token
      const newPayload = {
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role
      };
      const newToken = jwt.sign(newPayload, JWT_SECRET, { expiresIn: config.jwt.expiresIn });
      
      // 在响应头中返回新token
      res.setHeader('X-New-Token', newToken);
      logger.info(`用户 ${decoded.username} 的token已自动续期`);
    }
    
    req.user = decoded; // 将解码后的用户信息附加到请求对象
    next(); // 继续处理请求
  } catch (err) {
    logger.error(`JWT验证失败: ${err.message}`);
    res.status(401).json({ code: -1, success: false, message: '无效的认证令牌', data: {} });
  }
};

module.exports = authMiddleware;
module.exports.JWT_SECRET = JWT_SECRET;