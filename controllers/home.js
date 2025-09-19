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
      let account = null;
      let adPlans = [];
      let adCreatives = [];
      if (!accountId) {
        return ResponseUtils.forbidden();
      }
      // 如果提供了accountId，获取指定账户信息
      account = await Account.findById(accountId);
      if (!account) {
        return ResponseUtils.notFound(res, "指定的账户不存在");
      }

      // 根据账户ID获取对应的广告计划和创意
      const accountAdPlans = await AdPlan.findByAccountId(accountId);
      const accountAdCreatives = await AdCreatives.findByAccountId(accountId);

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

      return ResponseUtils.success(res, 200, "获取首页信息成功", responseData);
    } catch (error) {
      console.error("获取首页信息失败:", error);
      return ResponseUtils.serverError(res, "获取首页信息失败");
    }
  }
}

module.exports = HomeController;
