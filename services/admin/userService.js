const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const knex = require('../../models/knex');

class AdminUserService {
  /**
   * 创建用户
   * @param {Object} userData - 用户数据
   * @param {string} userData.username - 用户名
   * @param {string} userData.name - 姓名
   * @param {string} userData.password - 密码
   * @param {string} userData.role - 角色
   * @returns {Promise<Object>} 创建结果
   */
  static async createUser(userData) {
    const { username, name, password, role } = userData;

    try {
      // 检查用户名是否已存在
      const existingUser = await knex('user')
        .where('username', username)
        .first();

      if (existingUser) {
        return {
          success: false,
          message: '用户名已存在'
        };
      }

      // 加密密码
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 创建用户数据
      const newUserData = {
        username,
        name,
        password: hashedPassword,
        role,
        created_at: new Date(),
        updated_at: new Date()
      };

      // 插入用户到数据库
      const [userId] = await knex('user').insert(newUserData);

      // 获取创建的用户信息（不包含密码）
      const createdUser = await knex('user')
        .select('id', 'username', 'name', 'role', 'created_at', 'updated_at')
        .where('id', userId)
        .first();

      return {
        success: true,
        user: createdUser
      };

    } catch (error) {
      console.error('创建用户时发生错误:', error);
      return {
        success: false,
        message: '创建用户时发生内部错误'
      };
    }
  }

  /**
   * 验证密码
   * @param {string} plainPassword - 明文密码
   * @param {string} hashedPassword - 加密后的密码
   * @returns {Promise<boolean>} - 密码是否匹配
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('密码验证失败:', error);
      throw error;
    }
  }

  /**
   * 修改用户
   * @param {number} userId - 用户ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} - 操作结果
   */
  static async updateUser(userId, updateData) {
    const trx = await knex.transaction();
    
    try {
      // 检查用户是否存在
      const existingUser = await trx('user').where('id', userId).first();
      if (!existingUser) {
        await trx.rollback();
        return {
          success: false,
          message: '用户不存在'
        };
      }

      // 如果要修改密码，先加密
      if (updateData.password) {
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(updateData.password, saltRounds);
      }

      // 更新用户信息
      await trx('user')
        .where('id', userId)
        .update({
          ...updateData,
          updated_at: new Date()
        });

      // 获取更新后的用户信息（不包含密码）
      const updatedUser = await trx('user')
        .where('id', userId)
        .select('id', 'username', 'name', 'role', 'created_at', 'updated_at')
        .first();

      await trx.commit();

      return {
        success: true,
        user: updatedUser
      };

    } catch (error) {
      await trx.rollback();
      console.error('修改用户失败:', error);
      throw error;
    }
  }
}

module.exports = AdminUserService;