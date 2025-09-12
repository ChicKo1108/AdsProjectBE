const Account = require('../models/account');
const AdPlan = require('../models/adPlan');
const AdCreatives = require('../models/adCreatives');

class HomeController {
  /**
   * 获取首页信息
   * 包括账户信息、时间倒序前五条广告计划、时间倒序前五条广告创意
   */
  static async getHomeInfo(req, res) {
    try {
      // 获取账户信息（假设用户只有一个账户，取第一个）
      const accounts = await Account.all();
      const account = accounts.length > 0 ? accounts[0] : null;
      
      if (!account) {
        return res.status(404).json({
          success: false,
          message: '账户信息不存在'
        });
      }

      // 获取时间倒序前五条广告计划
      const adPlansQuery = await AdPlan.all();
      const adPlans = adPlansQuery
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      // 获取时间倒序前五条广告创意
      const adCreativesQuery = await AdCreatives.all();
      const adCreatives = adCreativesQuery
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      // 构造响应数据
      const responseData = {
        account,
        adPlans,
        adCreatives,
      };

      res.json({
        success: true,
        data: responseData
      });

    } catch (error) {
      console.error('获取首页信息失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误',
        error: error.message
      });
    }
  }
}

module.exports = HomeController;