const AdminAccountService = require('../../services/admin/accountService');
const { isAdmin } = require('../../utils/permissionUtils');

class AdminAccountController {
  /**
   * 修改账户信息
   */
  static async updateAccount(req, res) {
    try {
      // 权限验证：只有管理员可以修改账户信息
      if (!isAdmin(req.user)) {
        return res.status(403).json({
          code: 403,
          message: '权限不足，只有管理员可以修改账户信息',
          data: null
        });
      }

      const { balance, today_cost, account_daily_budget } = req.body;

      // 数值类型验证
      const numericFields = {
        balance: '余额',
        today_cost: '今日消耗',
        account_daily_budget: '账户日预算'
      };

      const updateData = {};
      for (const [field, label] of Object.entries(numericFields)) {
        const value = req.body[field];
        if (value !== undefined && value !== null) {
          if (isNaN(value) || value < 0) {
            return res.status(400).json({
              code: 400,
              message: `${label}必须为非负数`,
              data: null
            });
          }
          updateData[field] = parseFloat(value);
        }
      }

      // 检查是否有需要更新的字段
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          code: 400,
          message: '请提供需要更新的字段',
          data: null
        });
      }

      const result = await AdminAccountService.updateAccount(updateData);

      if (result.success) {
        return res.status(200).json({
          code: 200,
          message: '账户信息修改成功',
          data: {
            account: result.data
          }
        });
      } else {
        return res.status(400).json({
          code: 400,
          message: result.message,
          data: null
        });
      }

    } catch (error) {
      console.error('修改账户信息失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  }
}

module.exports = AdminAccountController;