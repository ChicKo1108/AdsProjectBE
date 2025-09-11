const Base = require('./base');

// User.js
/**
 * User 模型类
 * @class
 * @extends Base
 * 
 * @property {string} table - 表名 ('user')
 * 
 * 表结构：
 * - id: number (主键, 自增)
 * - username: string (用户名, 唯一)
 * - password: string (加密密码)
 * - created_at: Date (创建时间)
 * - updated_at: Date (更新时间)
 * - ban: number (状态: 0-未禁用, 1-禁用)
 */
class User extends Base {
  // 定义参数默认值为 user 表
  constructor(props = 'user'){
    super(props);
  }

  // 根据用户名查找用户
  findByUsername(username) {
    return require('../models/knex')(this.table).where('username', username).first();
  }

  // 根据角色查找用户
  findByRole(role) {
    return require('../models/knex')(this.table).where('role', role).select();
  }

  // 检查用户是否被禁用
  isBanned(id) {
    return require('../models/knex')(this.table).where('id', id).first()
      .then(user => {
        if (!user) return Promise.reject(new Error('用户不存在'));
        return !!user.ban;
      });
  }

  // 禁用/解禁用户
  toggleBan(id, banStatus) {
    return this.update(id, { ban: banStatus });
  }

  // 更改用户角色
  changeRole(id, role) {
    if (!['super-admin', 'admin', 'user'].includes(role)) {
      return Promise.reject(new Error('无效的角色类型'));
    }
    return this.update(id, { role });
  }

  // 验证用户密码
  validatePassword(username, password) {
    return this.findByUsername(username)
      .then(user => {
        if (!user) return Promise.reject(new Error('用户不存在'));
        // 这里应该使用加密比较，但为了简单起见，直接比较
        // 实际项目中应该使用bcrypt等库进行密码加密和比较
        return user.password === password ? user : Promise.reject(new Error('密码错误'));
      });
  }
}

module.exports = new User();