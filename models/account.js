const Base = require('./base');

// Account.js
/**
 * Account 模型类
 * @class
 * @extends Base
 * 
 * @property {string} table - 表名 ('account')
 * 
 * 表结构：
 * - id: number (主键, 自增)
 * - name: string (账户名称)
 * - display_id: string (显示ID, 唯一)
 * - balance: number (余额)
 * - today_cost: number (今日广告消耗)
 * - account_daily_budget: number (账户日预算)
 * - created_at: Date (创建时间)
 * - updated_at: Date (更新时间)
 */
class Account extends Base {
  // 定义参数默认值为 account 表
  constructor(props = 'account'){
    super(props);
  }

  findById(id) {
    return this.query()
      .where('id', id)
      .first();
  }

  // 根据display_id查找账户
  findByDisplayId(displayId) {
    return this.query()
      .where('display_id', displayId)
      .first();
  }

  // 更新display_id
  updateDisplayId(id, displayId) {
    return this.update(id, { 
      display_id: displayId,
      updated_at: new Date()
    });
  }

  // 检查display_id是否已存在
  async isDisplayIdExists(displayId, excludeId = null) {
    const query = this.query()
      .where('display_id', displayId);
    
    if (excludeId) {
      query.whereNot('id', excludeId);
    }
    
    const result = await query.first();
    return !!result;
  }

  // 根据名称查找账户
  findByName(name) {
    return this.query()
      .where('name', 'like', `%${name}%`)
      .select();
  }

  // 更新账户名称
  updateName(id, name) {
    return this.update(id, { 
      name: name,
      updated_at: new Date()
    });
  }

  // 根据余额范围查找账户
  findByBalanceRange(minBalance, maxBalance) {
    return this.query()
      .whereBetween('balance', [minBalance, maxBalance])
      .select();
  }

  // 获取今日消耗总额
  getTodayTotalCost() {
    return this.query()
      .sum('today_cost as total_cost')
      .first();
  }

  // 更新余额
  updateBalance(id, newBalance) {
    return this.update(id, { 
      balance: newBalance,
      updated_at: new Date()
    });
  }

  // 更新今日消耗
  updateTodayCost(id, cost) {
    return this.update(id, { 
      today_cost: cost,
      updated_at: new Date()
    });
  }

  // 更新账户日预算
  updateDailyBudget(id, budget) {
    return this.update(id, { 
      account_daily_budget: budget,
      updated_at: new Date()
    });
  }

  // 检查账户余额是否充足
  hasEnoughBalance(id, amount) {
    return this.query()
      .where('id', id)
      .first()
      .then(account => {
        if (!account) return Promise.reject(new Error('账户不存在'));
        return account.balance >= amount;
      });
  }

  // 扣除余额
  deductBalance(id, amount) {
    return this.query()
      .where('id', id)
      .first()
      .then(account => {
        if (!account) return Promise.reject(new Error('账户不存在'));
        if (account.balance < amount) return Promise.reject(new Error('余额不足'));
        
        const newBalance = account.balance - amount;
        return this.update(id, { 
          balance: newBalance,
          updated_at: new Date()
        });
      });
  }

  // 充值余额
  addBalance(id, amount) {
    return this.query()
      .where('id', id)
      .first()
      .then(account => {
        if (!account) return Promise.reject(new Error('账户不存在'));
        
        const newBalance = account.balance + amount;
        return this.update(id, { 
          balance: newBalance,
          updated_at: new Date()
        });
      });
  }

  // ========== 账户-用户多对多关系方法 ==========

  // 获取账户关联的所有用户
  getUsers(accountId) {
    return require('../models/knex')('user_account')
      .join('user', 'user_account.user_id', 'user.id')
      .where('user_account.account_id', accountId)
      .where('user_account.is_active', true)
      .select(
        'user.id',
        'user.username',
        'user.name',
        'user.role as user_system_role',
        'user.ban',
        'user.created_at as user_created_at',
        'user_account.role as account_role',
        'user_account.is_active',
        'user_account.created_at as relation_created_at'
      );
  }

  // 添加用户到账户
  addUser(accountId, userId, role = 'ad_operator') {
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

  // 从账户中移除用户
  removeUser(accountId, userId) {
    return require('../models/knex')('user_account')
      .where('account_id', accountId)
      .where('user_id', userId)
      .del();
  }

  // 更新用户在账户中的角色
  updateUserRole(accountId, userId, role) {
    const validRoles = ['site_admin', 'ad_operator'];
    if (!validRoles.includes(role)) {
      return Promise.reject(new Error('无效的角色类型'));
    }

    return require('../models/knex')('user_account')
      .where('account_id', accountId)
      .where('user_id', userId)
      .update({
        role: role,
        updated_at: new Date()
      });
  }

  // 获取账户的所有者（站点管理员）
  getOwners(accountId) {
    return require('../models/knex')('user_account')
      .join('user', 'user_account.user_id', 'user.id')
      .where('user_account.account_id', accountId)
      .where('user_account.role', 'site_admin')
      .where('user_account.is_active', true)
      .select('user.*', 'user_account.created_at as relation_created_at');
  }

  // 获取账户的管理员（站点管理员和广告操作员）
  getAdmins(accountId) {
    return require('../models/knex')('user_account')
      .join('user', 'user_account.user_id', 'user.id')
      .where('user_account.account_id', accountId)
      .whereIn('user_account.role', ['site_admin', 'ad_operator'])
      .where('user_account.is_active', true)
      .select('user.*', 'user_account.role as account_role', 'user_account.created_at as relation_created_at');
  }

  // 检查用户是否有权限操作账户
  checkUserPermission(accountId, userId, requiredRole = 'ad_operator') {
    const roleHierarchy = { 'site_admin': 2, 'ad_operator': 1 };
    
    return require('../models/knex')('user_account')
      .where('account_id', accountId)
      .where('user_id', userId)
      .where('is_active', true)
      .first()
      .then(relation => {
        if (!relation) return false;
        return roleHierarchy[relation.role] >= roleHierarchy[requiredRole];
      });
  }

  // 获取账户的用户数量统计
  getUserStats(id) {
    return this.knex('user_account')
      .where({ account_id: id })
      .select('role')
      .then(users => {
        const stats = {
          site_admin: 0,
          ad_operator: 0,
          total: 0
        };
        
        users.forEach(user => {
          stats[user.role]++;
          stats.total++;
        });
        
        return stats;
      });
  }

  // AdGroup关联方法
  async getAdGroups(id) {
    const AdGroup = require('./adGroup');
    return AdGroup.findByAccountId(id);
  }

  async addAdGroup(id, adGroupData) {
    const AdGroup = require('./adGroup');
    return AdGroup.createWithAccount(adGroupData, id);
  }

  async removeAdGroup(id, adGroupId) {
    const AdGroup = require('./adGroup');
    return AdGroup.delete(adGroupId);
  }

  // AdPlan关联方法
  async getAdPlans(id) {
    const AdPlan = require('./adPlan');
    return AdPlan.findByAccountId(id);
  }

  async addAdPlan(id, adPlanData) {
    const AdPlan = require('./adPlan');
    return AdPlan.createWithAccount(adPlanData, id);
  }

  async removeAdPlan(id, adPlanId) {
    const AdPlan = require('./adPlan');
    return AdPlan.delete(adPlanId);
  }

  // AdCreatives关联方法
  async getAdCreatives(id) {
    const AdCreatives = require('./adCreatives');
    return AdCreatives.findByAccountId(id);
  }

  async addAdCreatives(id, adCreativesData) {
    const AdCreatives = require('./adCreatives');
    return AdCreatives.createWithAccount(adCreativesData, id);
  }

  async removeAdCreatives(id, adCreativesId) {
    const AdCreatives = require('./adCreatives');
    return AdCreatives.delete(adCreativesId);
  }

  // 获取账户的所有广告实体统计
  async getAdStats(id) {
    const [adGroups, adPlans, adCreatives] = await Promise.all([
      this.getAdGroups(id),
      this.getAdPlans(id),
      this.getAdCreatives(id)
    ]);

    return {
      adGroups: adGroups.length,
      adPlans: adPlans.length,
      adCreatives: adCreatives.length,
      total: adGroups.length + adPlans.length + adCreatives.length
    };
  }
}

module.exports = new Account();