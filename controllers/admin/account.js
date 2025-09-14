const AdminAccountService = require("../../services/admin/accountService");
const { isAdmin } = require("../../utils/permissionUtils");
const ResponseUtils = require("../../utils/responseUtils");

class AdminAccountController {
  /**
   * 获取账户信息
   */
  static async getAccount(req, res) {
    try {
      // 权限验证：只有管理员可以查看账户信息
      if (!isAdmin(req.user)) {
        return ResponseUtils.forbidden("权限不足，只有管理员可以查看账户信息");
      }

      const result = await AdminAccountService.getAccount();

      if (result.success) {
        return ResponseUtils.success(res, 200, "", result.data);
      } else {
        return ResponseUtils.badRequest(result.message);
      }
    } catch (error) {
      console.error("获取账户信息失败:", error);
      return ResponseUtils.serverError();
    }
  }

  /**
   * 修改账户信息
   */
  static async updateAccount(req, res) {
    try {
      // 权限验证：只有管理员可以修改账户信息
      if (!isAdmin(req.user)) {
        return ResponseUtils.forbidden("权限不足，只有管理员可以修改账户信息");
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
            return ResponseUtils.badRequest(`${label}必须为非负数`);
          }
          updateData[field] = parseFloat(value);
        }
      }

      // 检查是否有需要更新的字段
      if (Object.keys(updateData).length === 0) {
        return ResponseUtils.badRequest("请提供需要更新的字段");
      }

      const result = await AdminAccountService.updateAccount(updateData);

      if (result.success) {
        return ResponseUtils.success(res, 200, "账户信息修改成功", result.data);
      } else {
        return ResponseUtils.badRequest(result.message);
      }
    } catch (error) {
      console.error("修改账户信息失败:", error);
      return ResponseUtils.serverError();
    }
  }
}

module.exports = AdminAccountController;
