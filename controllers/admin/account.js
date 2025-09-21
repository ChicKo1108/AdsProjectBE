const AdminAccountService = require("../../services/admin/accountService");
const { isSuperAdmin } = require("../../utils/permissionUtils");
const ResponseUtils = require("../../utils/responseUtils");
const Account = require("../../models/account");

class AdminAccountController {
  /**
   * 获取账户信息
   * 所有认证用户都可以查看账户信息
   */
  static async getAccount(req, res) {
    try {
      // 只需要基本的认证验证，不需要特殊权限
      // authMiddleware 已经确保了用户已认证

      // 从查询参数或路径参数中获取accountId
      const accountId = req.params.accountId || req.query.accountId;
      
      if (!accountId) {
        return ResponseUtils.badRequest(res, "请提供账户ID");
      }

      const result = await AdminAccountService.getAccount(accountId);

      if (result.success) {
        return ResponseUtils.success(res, 200, "", result.data);
      } else {
        return ResponseUtils.badRequest(res, result.message);
      }
    } catch (error) {
      console.error("获取账户信息失败:", error);
      return ResponseUtils.serverError(res, "获取账户信息失败");
    }
  }

  /**
   * 获取所有账户列表
   * 只有超级管理员可以查看所有账户
   */
  static async getAccountList(req, res) {
    try {
      // 权限验证：只有超级管理员可以获取所有账户列表
      if (!isSuperAdmin(req.user)) {
        return ResponseUtils.forbidden(res, '权限不足，只有超级管理员可以获取账户列表');
      }

      // 获取所有账户
      const accounts = await Account.all();
      
      return ResponseUtils.success(res, 200, '获取账户列表成功', accounts);
    } catch (error) {
      console.error('获取账户列表失败:', error);
      return ResponseUtils.serverError(res, '获取账户列表失败');
    }
  }

  /**
   * 修改账户信息
   * 只有super-admin和当前账户下的site_admin才能修改
   */
  static async updateAccount(req, res) {
    try {
      if (!hasAccountPermission(req)) {
        return ResponseUtils.forbidden(res, "权限不足，只有超级管理员或账户管理员可以修改账户信息");
      }

      // 数值类型验证
      const numericFields = {
        balance: "余额",
        today_cost: "今日消耗",
        account_daily_budget: "账户日预算",
      };

      const updateData = {};
      for (const [field, label] of Object.entries(numericFields)) {
        const value = req.body[field];
        if (value !== undefined && value !== null) {
          if (isNaN(value) || value < 0) {
            return ResponseUtils.badRequest(res, `${label}必须为非负数`);
          }
          updateData[field] = parseFloat(value);
        }
      }

      // 检查是否有需要更新的字段
      if (Object.keys(updateData).length === 0) {
        return ResponseUtils.badRequest(res, "请提供需要更新的字段");
      }

      const result = await AdminAccountService.updateAccount(updateData);

      if (result.success) {
        return ResponseUtils.success(res, 200, "账户信息修改成功", result.data);
      } else {
        return ResponseUtils.badRequest(res, result.message);
      }
    } catch (error) {
      console.error("修改账户信息失败:", error);
      return ResponseUtils.serverError(res, "修改账户信息失败");
    }
  }
}

module.exports = AdminAccountController;
