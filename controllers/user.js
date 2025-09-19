// 引用用户模版数据
const User = require('../models/user.js');
const ResponseUtils = require('../utils/responseUtils');

const userController = {
  // showUser 获取用户数据并返回到页面
  showUser: async function(req, res, next) {
    try {
      let userData = await User.all();
      return ResponseUtils.success(res, 200, '操作成功', userData);
    } catch (e) {
      console.error('获取用户数据失败:', e);
      return ResponseUtils.serverError(res, '操作失败');
    }
  },

  // getUserAccounts 获取用户可访问的账户列表
  getUserAccounts: async function(req, res, next) {
    try {
      const userId = req.user.userId;
      
      if (!userId) {
        return ResponseUtils.badRequest(res, '用户ID不存在');
      }

      // 获取用户可访问的账户列表
      const accounts = await User.getAccessibleAccounts(userId);
      
      return ResponseUtils.success(res, 200, '获取用户账户列表成功', accounts);
    } catch (e) {
      console.error('获取用户账户列表失败:', e);
      return ResponseUtils.serverError(res, '获取用户账户列表失败');
    }
  },
}

module.exports = userController;