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
      debugger;
      const user = await knex('user').where({ username }).first();
      console.log(user);
      
      if (!user) {
        return {
          success: false,
          message: '用户名或密码错误'
        };
      }

      // 验证密码
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return {
          success: false,
          message: '用户名或密码错误'
        };
      }

      // 验证账号封禁
      if (user.ban) {
        return {
          success: false,
          message: '账号已被封禁'
        };
      }

      // 获取用户的账户权限信息
      let accountPermissions = [];
      if (user.role !== 'super-admin') {
        // 非超级管理员需要获取其在各个账户中的权限
        accountPermissions = await knex('user_account')
          .join('account', 'user_account.account_id', 'account.id')
          .where('user_account.user_id', user.id)
          .where('user_account.is_active', true)
          .select(
            'account.id as accountId',
            'account.name as accountName',
            'user_account.role as accountRole'
          );
      }

      // 生成JWT token
      const payload = {
        userId: user.id,
        username: user.username,
        role: user.role || 'user',
        accountPermissions: accountPermissions
      };
      
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: config.jwt.expiresIn });

      return {
        success: true,
        token: token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role || 'user',
          accountPermissions: accountPermissions
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
  
  static async getUserInfo(username) {
    try {
      const user = await knex('user')
        .select(['id', 'username', 'name', 'role', 'created_at', 'updated_at'])
        .where({ username })
        .first();
      if (!user) {
        return null;
      }
      return user;
    } catch (error) {
      console.error('获取用户信息失败:', error);
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
        .select('id', 'username', 'name', 'role', 'ban')
        .first();
      
      if (!user) {
        return {
          success: false,
          message: '用户不存在'
        };
      }

      // 验证账号封禁
      if (user.ban) {
        return {
          success: false,
          message: '账号已被封禁',
          banned: true
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

  /**
   * 修改用户姓名
   * @param {number} userId - 用户ID
   * @param {string} name - 新姓名
   * @returns {Promise<Object>} - 修改结果
   */
  static async updateName(userId, name) {
    try {
      // 检查用户是否存在
      const user = await knex('user').where({ id: userId }).first();
      if (!user) {
        return {
          success: false,
          message: '用户不存在'
        };
      }

      // 更新姓名
      await knex('user')
        .where({ id: userId })
        .update({
          name: name,
          updated_at: new Date()
        });

      return {
        success: true,
        message: '姓名修改成功'
      };

    } catch (error) {
      console.error('修改姓名时发生错误:', error);
      return {
        success: false,
        message: '修改姓名时发生内部错误'
      };
    }
  }

  /**
   * 修改用户密码
   * @param {number} userId - 用户ID
   * @param {string} oldPassword - 原密码
   * @param {string} newPassword - 新密码
   * @returns {Promise<Object>} - 修改结果
   */
  static async updatePassword(userId, oldPassword, newPassword) {
    try {
      // 检查用户是否存在并获取当前密码
      const user = await knex('user').where({ id: userId }).first();
      if (!user) {
        return {
          success: false,
          message: '用户不存在'
        };
      }

      // 验证原密码
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return {
          success: false,
          message: '原密码不正确'
        };
      }

      // 加密新密码
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // 更新密码
      await knex('user')
        .where({ id: userId })
        .update({
          password: hashedNewPassword,
          updated_at: new Date()
        });

      return {
        success: true,
        message: '密码修改成功'
      };

    } catch (error) {
      console.error('修改密码时发生错误:', error);
      return {
        success: false,
        message: '修改密码时发生内部错误'
      };
    }
  }
}

module.exports = AuthService;