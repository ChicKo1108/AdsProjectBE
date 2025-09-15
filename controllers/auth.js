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

  /**
   * 修改姓名
   */
  static async updateName(req, res) {
    try {
      const authHeader = req.headers.authorization;
      
      // 检查Authorization header
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return ResponseUtils.unauthorized(res, 'Token格式不正确');
      }

      // 提取token
      const token = authHeader.substring(7);
      
      if (!token) {
        return ResponseUtils.unauthorized(res, 'Token不能为空');
      }

      // 验证token并获取用户信息
      const tokenResult = await AuthService.verifyToken(token);
      if (!tokenResult.success) {
        return ResponseUtils.unauthorized(res, tokenResult.message);
      }

      const { name } = req.body;

      // 参数验证
      if (!name || !name.trim()) {
        return ResponseUtils.badRequest(res, '姓名不能为空');
      }

      if (name.trim().length > 50) {
        return ResponseUtils.badRequest(res, '姓名长度不能超过50个字符');
      }

      // 调用服务层修改姓名
      const result = await AuthService.updateName(tokenResult.user.id, name.trim());

      if (!result.success) {
        return ResponseUtils.badRequest(res, result.message);
      }

      logger.info(`用户 ${tokenResult.user.username} 修改姓名成功`);
      return ResponseUtils.success(res, 200, '姓名修改成功', {
        success: true,
        message: '姓名修改成功'
      });

    } catch (error) {
      logger.error(`修改姓名失败: ${error.message}`);
      return ResponseUtils.serverError(res, '修改姓名失败');
    }
  }

  /**
   * 修改密码
   */
  static async updatePassword(req, res) {
    try {
      const authHeader = req.headers.authorization;
      
      // 检查Authorization header
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return ResponseUtils.unauthorized(res, 'Token格式不正确');
      }

      // 提取token
      const token = authHeader.substring(7);
      
      if (!token) {
        return ResponseUtils.unauthorized(res, 'Token不能为空');
      }

      // 验证token并获取用户信息
      const tokenResult = await AuthService.verifyToken(token);
      if (!tokenResult.success) {
        return ResponseUtils.unauthorized(res, tokenResult.message);
      }

      const { oldPassword, newPassword, confirmPassword } = req.body;

      // 参数验证
      if (!oldPassword) {
        return ResponseUtils.badRequest(res, '原密码不能为空');
      }

      if (!newPassword) {
        return ResponseUtils.badRequest(res, '新密码不能为空');
      }

      if (!confirmPassword) {
        return ResponseUtils.badRequest(res, '确认密码不能为空');
      }

      if (newPassword !== confirmPassword) {
        return ResponseUtils.badRequest(res, '两次输入的密码不一致');
      }

      if (newPassword.length < 6) {
        return ResponseUtils.badRequest(res, '新密码长度不能少于6位');
      }

      if (oldPassword === newPassword) {
        return ResponseUtils.badRequest(res, '新密码不能与原密码相同');
      }

      // 调用服务层修改密码
      const result = await AuthService.updatePassword(tokenResult.user.id, oldPassword, newPassword);

      if (!result.success) {
        return ResponseUtils.badRequest(res, result.message);
      }

      logger.info(`用户 ${tokenResult.user.username} 修改密码成功`);
      return ResponseUtils.success(res, 200, '密码修改成功', {
        success: true,
        message: '密码修改成功'
      });

    } catch (error) {
      logger.error(`修改密码失败: ${error.message}`);
      return ResponseUtils.serverError(res, '修改密码失败');
    }
  }
}

module.exports = AuthController;