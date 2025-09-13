const AuthService = require('../services/authService');
const logger = require('../logger');
const ResponseUtils = require('../utils/responseUtils');

class AuthController {
  /**
   * 用户登录
   */
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      // 参数验证
      if (!username || !username.trim()) {
        return ResponseUtils.badRequest(res, '用户名不能为空');
      }

      if (!password) {
        return ResponseUtils.badRequest(res, '密码不能为空');
      }

      // 调用服务层进行登录验证
      const result = await AuthService.login(username.trim(), password);
      const userInfo = await AuthService.getUserInfo(username.trim());

      if (!result.success) {
        return ResponseUtils.badRequest(res, result.message);
      }

      logger.info(`用户 ${username} 成功登录`);
      return ResponseUtils.success(res, 200, '登录成功', {
        token: result.token,
        userInfo
      });

    } catch (error) {
      logger.error(`登录失败: ${error.message}`);
      return ResponseUtils.serverError(res, '登录失败');
    }
  }

  /**
   * 用户注册
   */
  static async register(req, res) {
    try {
      const { username, password } = req.body;

      // 参数验证
      if (!username || !username.trim()) {
        return ResponseUtils.badRequest(res, '用户名不能为空');
      }

      if (!password || password.length < 6) {
        return ResponseUtils.badRequest(res, '密码不能为空且长度不能少于6位');
      }

      // 调用服务层进行注册
      const result = await AuthService.register(username.trim(), password);

      if (!result.success) {
        return ResponseUtils.badRequest(res, result.message);
      }

      logger.info(`用户 ${username} 成功注册`);
      return ResponseUtils.created(res, '注册成功', {
        userId: result.userId
      });

    } catch (error) {
      logger.error(`注册失败: ${error.message}`);
      return ResponseUtils.serverError(res, '注册失败');
    }
  }

  /**
   * 验证token
   */
  static async validateToken(req, res) {
    try {
      const authHeader = req.headers.authorization;
      
      // 检查Authorization header
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return ResponseUtils.unauthorized(res, 'Token格式不正确');
      }

      // 提取token
      const token = authHeader.substring(7); // 移除 'Bearer ' 前缀
      
      if (!token) {
        return ResponseUtils.unauthorized(res, 'Token不能为空');
      }

      // 调用服务层验证token
      const result = await AuthService.verifyToken(token);

      if (!result.success) {
        return ResponseUtils.unauthorized(res, result.message);
      }

      logger.info(`Token验证成功，用户: ${result.user.username}`);
      return ResponseUtils.success(res, 200, 'Token有效', {
        valid: true,
        user: result.user
      });

    } catch (error) {
      logger.error(`Token验证失败: ${error.message}`);
      return ResponseUtils.serverError(res, 'Token验证失败');
    }
  }
}

module.exports = AuthController;