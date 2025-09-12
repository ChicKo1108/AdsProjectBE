const AuthService = require('../services/authService');
const logger = require('../logger');

class AuthController {
  /**
   * 用户登录
   */
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      // 参数验证
      if (!username || !username.trim()) {
        return res.status(400).json({
          code: 400,
          message: '用户名不能为空',
          data: null
        });
      }

      if (!password) {
        return res.status(400).json({
          code: 400,
          message: '密码不能为空',
          data: null
        });
      }

      // 调用服务层进行登录验证
      const result = await AuthService.login(username.trim(), password);

      if (!result.success) {
        return res.status(400).json({
          code: 400,
          message: result.message,
          data: null
        });
      }

      logger.info(`用户 ${username} 成功登录`);
      res.status(200).json({
        code: 200,
        message: '登录成功',
        data: {
          token: result.token
        }
      });

    } catch (error) {
      logger.error(`登录失败: ${error.message}`);
      res.status(500).json({
        code: 500,
        message: '登录失败',
        data: null
      });
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
        return res.status(400).json({
          code: 400,
          message: '用户名不能为空',
          data: null
        });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({
          code: 400,
          message: '密码不能为空且长度不能少于6位',
          data: null
        });
      }

      // 调用服务层进行注册
      const result = await AuthService.register(username.trim(), password);

      if (!result.success) {
        return res.status(400).json({
          code: 400,
          message: result.message,
          data: null
        });
      }

      logger.info(`用户 ${username} 成功注册`);
      res.status(201).json({
        code: 201,
        message: '注册成功',
        data: {
          userId: result.userId
        }
      });

    } catch (error) {
      logger.error(`注册失败: ${error.message}`);
      res.status(500).json({
        code: 500,
        message: '注册失败',
        data: null
      });
    }
  }
}

module.exports = AuthController;