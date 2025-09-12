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

  // 根据余额范围查找账户
  findByBalanceRange(minBalance, maxBalance) {
    return require('../models/knex')(this.table)
      .whereBetween('balance', [minBalance, maxBalance])
      .select();
  }

  // 获取今日消耗总额
  getTodayTotalCost() {
    return require('../models/knex')(this.table)
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
    return require('../models/knex')(this.table)
      .where('id', id)
      .first()
      .then(account => {
        if (!account) return Promise.reject(new Error('账户不存在'));
        return account.balance >= amount;
      });
  }

  // 扣除余额
  deductBalance(id, amount) {
    return require('../models/knex')(this.table)
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
    return require('../models/knex')(this.table)
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
}

module.exports = new Account();