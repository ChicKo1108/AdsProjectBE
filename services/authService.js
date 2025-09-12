const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const knex = require('../models/knex');
const config = require('../config');

const JWT_SECRET = config.jwt.secret;

class AuthService {
  /**
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<Object>} - 登录结果
   */
  static async login(username, password) {
    try {
      // 查找用户
      const user = await knex('user').where({ username }).first();
      if (!user) {
        return {
          success: false,
          message: '用户不存在'
        };
      }

      // 验证密码
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return {
          success: false,
          message: '密码不正确'
        };
      }

      // 生成JWT token
      const payload = {
        userId: user.id,
        username: user.username,
        role: user.role || 'user'
      };
      
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: config.jwt.expiresIn });

      return {
        success: true,
        token: token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role || 'user'
        }
      };

    } catch (error) {
      console.error('登录服务失败:', error);
      throw error;
    }
  }

  /**
   * 用户注册
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<Object>} - 注册结果
   */
  static async register(username, password) {
    const trx = await knex.transaction();
    
    try {
      // 检查用户是否已存在
      const existingUser = await trx('user').where({ username }).first();
      if (existingUser) {
        await trx.rollback();
        return {
          success: false,
          message: '用户已存在'
        };
      }

      // 加密密码
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 创建用户
      const [newUserId] = await trx('user').insert({
        username,
        password: hashedPassword,
        role: 'user', // 默认角色
        created_at: new Date(),
        updated_at: new Date()
      });

      await trx.commit();

      return {
        success: true,
        userId: newUserId
      };

    } catch (error) {
      await trx.rollback();
      console.error('注册服务失败:', error);
      throw error;
    }
  }

  /**
   * 验证JWT token
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - 验证结果
   */
  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // 检查用户是否仍然存在
      const user = await knex('user')
        .where({ id: decoded.userId })
        .select('id', 'username', 'name', 'role')
        .first();
      
      if (!user) {
        return {
          success: false,
          message: '用户不存在'
        };
      }

      return {
        success: true,
        user: user
      };

    } catch (error) {
      return {
        success: false,
        message: '无效的token'
      };
    }
  }
}

module.exports = AuthService;