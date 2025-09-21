const AdminAccountService = require("../../services/admin/accountService");
const { isSuperAdmin } = require("../../utils/permissionUtils");
const ResponseUtils = require("../../utils/responseUtils");
const Account = require("../../models/account");

class AdminAccountController {
  /**
   * 创建账户
   * 只有超级管理员可以创建账户
   */
  static async createAccount(req, res) {
    try {
      // 权限验证：只有超级管理员可以创建账户
      if (!isSuperAdmin(req.user)) {
        return ResponseUtils.forbidden(res, '权限不足，只有超级管理员才能创建账户');
      }

      const { name, display_id, balance = 0, account_daily_budget = 0 } = req.body;

      // 必填字段验证
      if (!name || !display_id) {
        return ResponseUtils.badRequest(res, "账户名称和显示ID不能为空");
      }

      // 字段格式验证
      if (typeof name !== 'string' || name.trim() === '') {
        return ResponseUtils.badRequest(res, "账户名称格式不正确");
      }

      if (typeof display_id !== 'string' || display_id.trim() === '') {
        return ResponseUtils.badRequest(res, "账户显示ID格式不正确");
      }

      // 数值字段验证
      if (isNaN(balance) || balance < 0) {
        return ResponseUtils.badRequest(res, "余额必须为非负数");
      }

      if (isNaN(account_daily_budget) || account_daily_budget < 0) {
        return ResponseUtils.badRequest(res, "账户日预算必须为非负数");
      }

      // 检查display_id是否已存在
      const isDisplayIdExists = await Account.isDisplayIdExists(display_id.trim());
      if (isDisplayIdExists) {
        return ResponseUtils.badRequest(res, "账户显示ID已存在");
      }

      // 创建账户数据
      const accountData = {
        name: name.trim(),
        display_id: display_id.trim(),
        balance: parseFloat(balance),
        today_cost: 0,
        account_daily_budget: parseFloat(account_daily_budget),
        created_at: new Date(),
        updated_at: new Date()
      };

      // 创建账户
      const accountId = await Account.insert(accountData);
      
      // 获取创建的账户信息
      const newAccount = await Account.findById(accountId);

      return ResponseUtils.success(res, 201, "账户创建成功", newAccount);
    } catch (error) {
      console.error("创建账户失败:", error);
      return ResponseUtils.serverError(res, "创建账户失败");
    }
  }

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
      
      // 为每个账户获取用户信息
      const accountsWithUsers = await Promise.all(
        accounts.map(async (account) => {
          const users = await Account.getUsers(account.id);
          return {
            ...account,
            users: users || []
          };
        })
      );
      
      return ResponseUtils.success(res, 200, '获取账户列表成功', accountsWithUsers);
    } catch (error) {
      console.error('获取账户列表失败:', error);
      return ResponseUtils.serverError(res, '获取账户列表失败');
    }
  }

  /**
   * 修改账户信息
   * 只有super-admin和当前账户下的site_admin才能修改
   * 可修改子账户信息字段包括：
   * - balance: 余额
   * - today_cost: 今日消耗
   * - account_daily_budget: 账户日预算
   * - name: 账户名称
   * - display_id: 账户显示ID
   */
  static async updateAccount(req, res) {
    try {
      const { id } = req.params;
      console.log(req.params);
      
      if (!id) {
        return ResponseUtils.badRequest(res, "账户ID不能为空");
      }

      // 检查账户是否存在
      const existingAccount = await Account.findById(id);
      if (!existingAccount) {
        return ResponseUtils.notFound(res, "账户不存在");
      }

      // 数值类型验证
      const numericFields = {
        balance: "余额",
        today_cost: "今日消耗",
        account_daily_budget: "账户日预算",
      };

      // 字符串类型字段
      const stringFields = {
        name: "账户名称",
        display_id: "账户显示ID"
      };

      const updateData = {};
      
      // 处理数值字段
      for (const [field, label] of Object.entries(numericFields)) {
        const value = req.body[field];
        if (value !== undefined && value !== null) {
          if (isNaN(value) || value < 0) {
            return ResponseUtils.badRequest(res, `${label}必须为非负数`);
          }
          updateData[field] = parseFloat(value);
        }
      }

      // 处理字符串字段
      for (const [field, label] of Object.entries(stringFields)) {
        const value = req.body[field];
        if (value !== undefined && value !== null) {
          if (typeof value !== 'string' || value.trim() === '') {
            return ResponseUtils.badRequest(res, `${label}不能为空`);
          }
          updateData[field] = value.trim();
        }
      }

      // 特殊处理display_id的唯一性检查
      if (updateData.display_id) {
        const isExists = await Account.isDisplayIdExists(updateData.display_id, id);
        if (isExists) {
          return ResponseUtils.badRequest(res, "账户显示ID已存在");
        }
      }

      // 检查是否有需要更新的字段
      if (Object.keys(updateData).length === 0) {
        return ResponseUtils.badRequest(res, "请提供需要更新的字段");
      }

      // 添加更新时间
      updateData.updated_at = new Date();

      // 更新账户信息
      await Account.update(id, updateData);
      
      // 获取更新后的账户信息
      const updatedAccount = await Account.findById(id);

      return ResponseUtils.success(res, 200, "账户信息修改成功", updatedAccount);
    } catch (error) {
      console.error("修改账户信息失败:", error);
      return ResponseUtils.serverError(res, "修改账户信息失败");
    }
  }
}

module.exports = AdminAccountController;
