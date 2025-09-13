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
}

module.exports = userController;