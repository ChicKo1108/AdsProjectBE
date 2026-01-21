const Account = require("../models/account");
const AdPlan = require("../models/adPlan");
const AdCreatives = require("../models/adCreatives");
const ResponseUtils = require("../utils/responseUtils");

class HomeController {
  /**
   * 获取首页信息
   * 包括账户信息、时间倒序前五条广告计划、时间倒序前五条广告创意
   */
  static async getHomeInfo(req, res) {
    try {
      const { accountId } = req.query;
      const knex = require('../models/knex');

      let targetAccountId = accountId;
      let account = null;
      let adPlans = [];
      let adCreatives = [];

      // 未提供 accountId 时，取当前用户已加入的第一个账户
      if (!targetAccountId) {
        const userId = req.user?.userId;
        if (!userId) {
          return ResponseUtils.unauthorized(res, '未提供用户信息或未登录');
        }
        
        const joinedAccounts = await knex('user_account')
          .join('account', 'user_account.account_id', 'account.id')
          .where('user_account.user_id', userId)
          .where('user_account.is_active', true)
          .select('account.id as id')
          .orderBy('account.created_at', 'asc');

        if (!joinedAccounts || joinedAccounts.length === 0) {
          return ResponseUtils.notFound(res, '当前用户未加入任何账户');
        }

        targetAccountId = joinedAccounts[0].id;
      }

      // 获取账户信息
      account = await Account.findById(targetAccountId);
      if (!account) {
        return ResponseUtils.notFound(res, '指定的账户不存在');
      }

      // 根据账户ID获取对应的广告计划和创意
      const accountAdPlans = await AdPlan.findByAccountId(targetAccountId);
      const accountAdCreatives = await AdCreatives.findByAccountId(targetAccountId);

      // 按创建时间倒序排列，取前5条
      adPlans = accountAdPlans
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      adCreatives = accountAdCreatives
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      // 构造响应数据
      const responseData = {
        account,
        adPlans,
        adCreatives,
      };

      return ResponseUtils.success(res, 200, '获取首页信息成功', responseData);
    } catch (error) {
      console.error('获取首页信息失败:', error);
      return ResponseUtils.serverError(res, '获取首页信息失败');
    }
  }
}

module.exports = HomeController;
