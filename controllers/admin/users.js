const AdminUserService = require("../../services/admin/userService");
const ResponseUtils = require("../../utils/responseUtils");

class AdminUserController {
  /**
   * 创建用户
   */
  static async createUser(req, res) {
    try {
      const { username, name, password, role } = req.body;

      // 参数验证
      if (!username || !username.trim()) {
        return ResponseUtils.badRequest(res, "用户名不能为空");
      }

      if (!password || password.length < 6) {
        return ResponseUtils.badRequest(res, "密码不能为空且长度不能少于6位");
      }

      // 验证角色
      const validRoles = ["super-admin", "admin", "user"];
      const userRole = role || "user"; // 默认角色为user
      if (!validRoles.includes(userRole)) {
        return ResponseUtils.badRequest(
          res,
          "角色必须是 super-admin, admin 或 user"
        );
      }

      // 调用服务层创建用户
      const result = await AdminUserService.createUser({
        username: username.trim(),
        name: (name || username).trim(),
        password,
        role: userRole,
      });

      if (!result.success) {
        return ResponseUtils.badRequest(res, result.message);
      }

      return ResponseUtils.created(res, "用户创建成功", {
        user: result.user,
      });
    } catch (error) {
      console.error("创建用户失败:", error);
      return ResponseUtils.serverError(res, "创建用户失败");
    }
  }

  /**
   * 修改用户
   */
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, password, role, ban } = req.body;

      // 参数验证
      if (!id || isNaN(parseInt(id))) {
        return ResponseUtils.badRequest(res, "用户ID无效");
      }

      // 至少需要一个参数
      if (!name && !password && !role && !(typeof ban === "boolean")) {
        return ResponseUtils.badRequest(res, "至少需要提供一个要修改的字段");
      }

      // 验证姓名
      if (name !== undefined && (!name || !name.trim())) {
        return ResponseUtils.badRequest(res, "姓名不能为空");
      }

      // 验证密码
      if (password !== undefined && password.length < 6) {
        return ResponseUtils.badRequest(res, "密码长度不能少于6位");
      }

      // 验证封禁状态
      if (ban !== undefined) {
        if (typeof ban !== "boolean") {
          return ResponseUtils.badRequest(res, "封禁状态必须是布尔值");
        }
        // 不能封禁自己
        if (ban && req.user.userId === parseInt(id)) {
          return ResponseUtils.badRequest(res, "不能封禁自己");
        }
      }

      // 验证角色
      if (role !== undefined) {
        const validRoles = ["super-admin", "admin", "user"];
        if (!validRoles.includes(role)) {
          return ResponseUtils.badRequest(
            res,
            "角色必须是 super-admin、admin 或 user"
          );
        }
        // 不能修改自己的角色
        if (req.user.userId === parseInt(id)) {
          return ResponseUtils.badRequest(res, "不能修改自己的权限");
        }
      }

      // 构建更新数据
      const updateData = {};
      if (name !== undefined) updateData.name = name.trim();
      if (password !== undefined) updateData.password = password;
      if (role !== undefined) updateData.role = role;
      if (ban !== undefined) updateData.ban = Number(ban);

      // 调用服务层修改用户
      const result = await AdminUserService.updateUser(
        parseInt(id),
        updateData
      );

      if (!result.success) {
        return ResponseUtils.badRequest(res, result.message);
      }

      return ResponseUtils.success(res, 200, "用户修改成功", result);
    } catch (error) {
      console.error("修改用户失败:", error);
      return ResponseUtils.serverError(res, "修改用户失败");
    }
  }

  /**
   * 获取用户列表
   */
  static async getUserList(req, res) {
    try {
      // 调用服务层获取用户列表
      const result = await AdminUserService.getUserList();
      return ResponseUtils.success(res, 200, "获取用户列表成功", result);
    } catch (error) {
      console.error("获取用户列表失败:", error);
      return ResponseUtils.serverError(res, "获取用户列表失败");
    }
  }

  /**
   * 获取用户的账户绑定信息
   */
  static async getUserAccounts(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(parseInt(id))) {
        return ResponseUtils.badRequest(res, "用户ID无效");
      }

      const result = await AdminUserService.getUserAccounts(parseInt(id));
      return ResponseUtils.success(res, 200, "获取用户账户绑定成功", result);
    } catch (error) {
      console.error("获取用户账户绑定失败:", error);
      return ResponseUtils.serverError(res, "获取用户账户绑定失败");
    }
  }

  /**
   * 绑定用户到账户
   */
  static async bindUserAccount(req, res) {
    try {
      const { id } = req.params;
      const { accountId, role } = req.body;

      if (!id || isNaN(parseInt(id))) {
        return ResponseUtils.badRequest(res, "用户ID无效");
      }

      if (!accountId || isNaN(parseInt(accountId))) {
        return ResponseUtils.badRequest(res, "账户ID无效");
      }

      const validRoles = ["site_admin", "ad_operator"];
      if (!role || !validRoles.includes(role)) {
        return ResponseUtils.badRequest(
          res,
          "角色必须是 site_admin 或 ad_operator"
        );
      }

      const result = await AdminUserService.bindUserAccount(
        parseInt(id),
        parseInt(accountId),
        role
      );

      if (!result.success) {
        return ResponseUtils.badRequest(res, result.message);
      }

      return ResponseUtils.success(res, 200, "用户账户绑定成功", result.data);
    } catch (error) {
      console.error("绑定用户账户失败:", error);
      return ResponseUtils.serverError(res, "绑定用户账户失败");
    }
  }

  /**
   * 解绑用户账户
   */
  static async unbindUserAccount(req, res) {
    try {
      const { id } = req.params;
      const { accountId } = req.body;

      if (!id || isNaN(parseInt(id))) {
        return ResponseUtils.badRequest(res, "用户ID无效");
      }

      if (!accountId || isNaN(parseInt(accountId))) {
        return ResponseUtils.badRequest(res, "账户ID无效");
      }

      const result = await AdminUserService.unbindUserAccount(
        parseInt(id),
        parseInt(accountId)
      );

      if (!result.success) {
        return ResponseUtils.badRequest(res, result.message);
      }

      return ResponseUtils.success(res, 200, "用户账户解绑成功", result.data);
    } catch (error) {
      console.error("解绑用户账户失败:", error);
      return ResponseUtils.serverError(res, "解绑用户账户失败");
    }
  }

  /**
   * 更新用户账户权限
   */
  static async updateUserAccountRole(req, res) {
    try {
      const { id } = req.params;
      const { accountId, role } = req.body;

      if (!id || isNaN(parseInt(id))) {
        return ResponseUtils.badRequest(res, "用户ID无效");
      }

      if (!accountId || isNaN(parseInt(accountId))) {
        return ResponseUtils.badRequest(res, "账户ID无效");
      }

      const validRoles = ["site_admin", "ad_operator"];
      if (!role || !validRoles.includes(role)) {
        return ResponseUtils.badRequest(
          res,
          "角色必须是 site_admin 或 ad_operator"
        );
      }

      const result = await AdminUserService.updateUserAccountRole(
        parseInt(id),
        parseInt(accountId),
        role
      );

      if (!result.success) {
        return ResponseUtils.badRequest(res, result.message);
      }

      return ResponseUtils.success(
        res,
        200,
        "用户账户权限更新成功",
        result.data
      );
    } catch (error) {
      console.error("更新用户账户权限失败:", error);
      return ResponseUtils.serverError(res, "更新用户账户权限失败");
    }
  }
}

module.exports = AdminUserController;
