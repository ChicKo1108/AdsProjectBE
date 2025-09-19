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
 * - name: string (用户姓名)
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

  // ========== 用户-账户多对多关系方法 ==========

  // 获取用户关联的所有账户
  getAccounts(userId) {
    return require('../models/knex')('user_account')
      .join('account', 'user_account.account_id', 'account.id')
      .where('user_account.user_id', userId)
      .where('user_account.is_active', true)
      .select(
        'account.*',
        'user_account.role as user_role',
        'user_account.is_active',
        'user_account.created_at as relation_created_at'
      );
  }

  // 绑定用户到账户
  bindAccount(userId, accountId, role = 'ad_operator') {
    const validRoles = ['site_admin', 'ad_operator'];
    if (!validRoles.includes(role)) {
      return Promise.reject(new Error('无效的角色类型'));
    }

    return require('../models/knex')('user_account')
      .insert({
        user_id: userId,
        account_id: accountId,
        role: role,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });
  }

  // 解绑用户和账户
  unbindAccount(userId, accountId) {
    return require('../models/knex')('user_account')
      .where('user_id', userId)
      .where('account_id', accountId)
      .del();
  }

  // 更新用户在账户中的角色
  updateAccountRole(userId, accountId, role) {
    const validRoles = ['site_admin', 'ad_operator'];
    if (!validRoles.includes(role)) {
      return Promise.reject(new Error('无效的角色类型'));
    }

    return require('../models/knex')('user_account')
      .where({ user_id: userId, account_id: accountId })
      .update({ 
        role: role,
        updated_at: new Date()
      });
  }

  // 激活/停用用户账户关联
  toggleAccountRelation(userId, accountId, isActive) {
    return require('../models/knex')('user_account')
      .where('user_id', userId)
      .where('account_id', accountId)
      .update({
        is_active: isActive,
        updated_at: new Date()
      });
  }

  // 检查用户是否有权限访问账户
  hasAccountPermission(userId, accountId, requiredRole = 'ad_operator') {
    const roleHierarchy = {
      'ad_operator': 1,
      'site_admin': 2
    };

    return require('../models/knex')('user_account')
      .where({ user_id: userId, account_id: accountId, is_active: true })
      .first()
      .then(relation => {
        if (!relation) return false;
        return roleHierarchy[relation.role] >= roleHierarchy[requiredRole];
      });
  }

  // ========== 新增权限相关方法 ==========

  // 检查用户是否为超级管理员
  isSuperAdmin(userId) {
    return require('../models/knex')(this.table)
      .where('id', userId)
      .first()
      .then(user => {
        return user && user.role === 'super-admin';
      });
  }

  // 获取用户的完整权限信息（包含全局权限和账户权限）
  getUserPermissions(userId) {
    return Promise.all([
      // 获取用户基本信息和全局权限
      require('../models/knex')(this.table).where('id', userId).first(),
      // 获取用户在各账户中的权限
      this.getAccounts(userId)
    ]).then(([user, accounts]) => {
      if (!user) {
        return Promise.reject(new Error('用户不存在'));
      }

      return {
        userId: user.id,
        username: user.username,
        globalRole: user.role,
        isSuperAdmin: user.role === 'super-admin',
        accounts: accounts.map(account => ({
          accountId: account.id,
          accountName: account.name,
          displayId: account.display_id,
          role: account.user_role,
          isActive: account.is_active,
          // 权限说明
          permissions: {
            canRead: true, // 所有角色都可以读取
            canWrite: account.user_role === 'site_admin' || user.role === 'super-admin',
            canDelete: account.user_role === 'site_admin' || user.role === 'super-admin',
            canManageAccount: account.user_role === 'site_admin' || user.role === 'super-admin'
          }
        }))
      };
    });
  }

  // 检查用户是否有访问特定账户的权限
  canAccessAccount(userId, accountId) {
    return Promise.all([
      this.isSuperAdmin(userId),
      require('../models/knex')('user_account')
        .where({ user_id: userId, account_id: accountId, is_active: true })
        .first()
    ]).then(([isSuperAdmin, accountRelation]) => {
      return isSuperAdmin || !!accountRelation;
    });
  }

  // 获取用户可访问的账户列表
  getAccessibleAccounts(userId) {
    return this.isSuperAdmin(userId).then(isSuperAdmin => {
      if (isSuperAdmin) {
        // 超级管理员可以访问所有账户
        return require('../models/knex')('account').select();
      } else {
        // 普通用户只能访问已绑定的账户
        return this.getAccounts(userId);
      }
    });
  }

  // 验证用户对账户的操作权限
  validateAccountOperation(userId, accountId, operation = 'read') {
    return Promise.all([
      this.isSuperAdmin(userId),
      require('../models/knex')('user_account')
        .where({ user_id: userId, account_id: accountId, is_active: true })
        .first()
    ]).then(([isSuperAdmin, accountRelation]) => {
      // 超级管理员拥有所有权限
      if (isSuperAdmin) {
        return true;
      }

      // 检查账户关联
      if (!accountRelation) {
        return false;
      }

      // 根据操作类型和角色判断权限
      switch (operation) {
        case 'read':
          // 所有角色都可以读取
          return true;
        case 'write':
        case 'update':
        case 'delete':
        case 'manage':
          // 只有site_admin可以写入、更新、删除和管理
          return accountRelation.role === 'site_admin';
        default:
          return false;
      }
    });
  }

  // 检查用户是否为账户的站点管理员
  isAccountAdmin(userId, accountId) {
    return Promise.all([
      this.isSuperAdmin(userId),
      require('../models/knex')('user_account')
        .where({ user_id: userId, account_id: accountId, is_active: true })
        .first()
    ]).then(([isSuperAdmin, accountRelation]) => {
      return isSuperAdmin || (accountRelation && accountRelation.role === 'site_admin');
    });
  }
}

module.exports = new User();