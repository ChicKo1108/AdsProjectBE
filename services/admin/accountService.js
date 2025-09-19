const knex = require('../../models/knex');

class AdminAccountService {
  /**
   * 修改账户信息
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} 更新结果
   */
  static async updateAccount(updateData) {
    const trx = await knex.transaction();
    
    try {
      // 检查是否存在账户记录，如果不存在则创建默认账户
      let account = await trx('account').first();
      
      if (!account) {
        // 创建默认账户记录
        const defaultAccountData = {
          balance: 0,
          today_cost: 0,
          account_daily_budget: 0,
          created_at: new Date(),
          updated_at: new Date()
        };
        
        const [accountId] = await trx('account').insert(defaultAccountData);
        account = await trx('account').where('id', accountId).first();
      }

      // 更新账户数据
      const finalUpdateData = {
        ...updateData,
        updated_at: new Date()
      };

      await trx('account')
        .where('id', account.id)
        .update(finalUpdateData);

      // 获取更新后的账户信息
      const updatedAccount = await trx('account')
        .where('id', account.id)
        .first();

      await trx.commit();

      return {
        success: true,
        data: updatedAccount
      };

    } catch (error) {
      await trx.rollback();
      console.error('修改账户信息时发生错误:', error);
      return {
        success: false,
        message: '修改账户信息时发生内部错误'
      };
    }
  }

  /**
   * 获取账户信息
   * @param {number} accountId - 账户ID
   * @returns {Promise<Object>} 查询结果
   */
  static async getAccount(accountId) {
    try {
      // 验证accountId参数
      if (!accountId || isNaN(accountId)) {
        return {
          success: false,
          message: '无效的账户ID'
        };
      }

      let account = await knex('account').where('id', accountId).first();
      
      if (!account) {
        return {
          success: false,
          message: '账户不存在'
        };
      }

      return {
        success: true,
        data: account
      };

    } catch (error) {
      console.error('查询账户信息时发生错误:', error);
      return {
        success: false,
        message: '查询账户信息时发生内部错误'
      };
    }
  }

  /**
   * 重置今日消耗
   * @returns {Promise<Object>} 重置结果
   */
  static async resetTodayCost() {
    try {
      await knex('account').update({
        today_cost: 0,
        updated_at: new Date()
      });

      const account = await knex('account').first();

      return {
        success: true,
        data: account
      };

    } catch (error) {
      console.error('重置今日消耗时发生错误:', error);
      return {
        success: false,
        message: '重置今日消耗时发生内部错误'
      };
    }
  }

  /**
   * 增加今日消耗
   * @param {number} cost - 消耗金额
   * @returns {Promise<Object>} 更新结果
   */
  static async addTodayCost(cost) {
    const trx = await knex.transaction();
    
    try {
      const account = await trx('account').first();
      
      if (!account) {
        await trx.rollback();
        return {
          success: false,
          message: '账户不存在'
        };
      }

      // 增加今日消耗
      const newTodayCost = parseFloat(account.today_cost) + parseFloat(cost);
      
      await trx('account')
        .where('id', account.id)
        .update({
          today_cost: newTodayCost,
          updated_at: new Date()
        });

      const updatedAccount = await trx('account')
        .where('id', account.id)
        .first();

      await trx.commit();

      return {
        success: true,
        data: updatedAccount
      };

    } catch (error) {
      await trx.rollback();
      console.error('增加今日消耗时发生错误:', error);
      return {
        success: false,
        message: '增加今日消耗时发生内部错误'
      };
    }
  }

  /**
   * 扣除余额
   * @param {number} amount - 扣除金额
   * @returns {Promise<Object>} 扣除结果
   */
  static async deductBalance(amount) {
    const trx = await knex.transaction();
    
    try {
      const account = await trx('account').first();
      
      if (!account) {
        await trx.rollback();
        return {
          success: false,
          message: '账户不存在'
        };
      }

      const currentBalance = parseFloat(account.balance);
      const deductAmount = parseFloat(amount);
      
      if (currentBalance < deductAmount) {
        await trx.rollback();
        return {
          success: false,
          message: '余额不足'
        };
      }

      const newBalance = currentBalance - deductAmount;
      
      await trx('account')
        .where('id', account.id)
        .update({
          balance: newBalance,
          updated_at: new Date()
        });

      const updatedAccount = await trx('account')
        .where('id', account.id)
        .first();

      await trx.commit();

      return {
        success: true,
        data: updatedAccount
      };

    } catch (error) {
      await trx.rollback();
      console.error('扣除余额时发生错误:', error);
      return {
        success: false,
        message: '扣除余额时发生内部错误'
      };
    }
  }
}

module.exports = AdminAccountService;