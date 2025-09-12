const AdminUserService = require('../../services/admin/userService');
const { isSuperAdmin } = require('../../utils/permissionUtils');

class AdminUserController {
  /**
   * 创建用户
   */
  static async createUser(req, res) {
    try {
      // 权限验证：只有超级管理员可以创建用户
      if (!isSuperAdmin(req.user)) {
        return res.status(403).json({
          code: 403,
          message: '权限不足，只有超级管理员可以创建用户',
          data: null
        });
      }

      const { username, name, password, role } = req.body;

      // 参数验证
      if (!username || !username.trim()) {
        return res.status(400).json({
          code: 400,
          message: '用户名不能为空',
          data: null
        });
      }

      if (!name || !name.trim()) {
        return res.status(400).json({
          code: 400,
          message: '姓名不能为空',
          data: null
        });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({
          code: 400,
          message: '密码不能为空且长度不能少于6位',
          data: null
        });
      }

      // 验证角色
      const validRoles = ['super-admin', 'admin', 'user'];
      const userRole = role || 'user'; // 默认角色为user
      if (!validRoles.includes(userRole)) {
        return res.status(400).json({
          code: 400,
          message: '角色必须是 super-admin、admin 或 user',
          data: null
        });
      }

      // 调用服务层创建用户
      const result = await AdminUserService.createUser({
        username: username.trim(),
        name: name.trim(),
        password,
        role: userRole
      });

      if (!result.success) {
        return res.status(400).json({
          code: 400,
          message: result.message,
          data: null
        });
      }

      res.status(201).json({
        code: 201,
        message: '用户创建成功',
        data: {
          user: result.user
        }
      });

    } catch (error) {
      console.error('创建用户失败:', error);
      res.status(500).json({
        code: 500,
        message: '创建用户失败',
        data: null
      });
    }
  }

  /**
   * 修改用户
   */
  static async updateUser(req, res) {
    try {
      // 权限验证：只有超级管理员可以修改用户
      if (!isSuperAdmin(req.user)) {
        return res.status(403).json({
          code: 403,
          message: '权限不足，只有超级管理员可以修改用户',
          data: null
        });
      }

      const { id } = req.params;
      const { name, password, role } = req.body;

      // 参数验证
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          code: 400,
          message: '用户ID无效',
          data: null
        });
      }

      // 至少需要一个参数
      if (!name && !password && !role) {
        return res.status(400).json({
          code: 400,
          message: '至少需要提供一个要修改的字段',
          data: null
        });
      }

      // 验证姓名
      if (name !== undefined && (!name || !name.trim())) {
        return res.status(400).json({
          code: 400,
          message: '姓名不能为空',
          data: null
        });
      }

      // 验证密码
      if (password !== undefined && password.length < 6) {
        return res.status(400).json({
          code: 400,
          message: '密码长度不能少于6位',
          data: null
        });
      }

      // 验证角色
      if (role !== undefined) {
        const validRoles = ['super-admin', 'admin', 'user'];
        if (!validRoles.includes(role)) {
          return res.status(400).json({
            code: 400,
            message: '角色必须是 super-admin、admin 或 user',
            data: null
          });
        }
      }

      // 构建更新数据
      const updateData = {};
      if (name !== undefined) updateData.name = name.trim();
      if (password !== undefined) updateData.password = password;
      if (role !== undefined) updateData.role = role;

      // 调用服务层修改用户
      const result = await AdminUserService.updateUser(parseInt(id), updateData);

      if (!result.success) {
        return res.status(400).json({
          code: 400,
          message: result.message,
          data: null
        });
      }

      res.status(200).json({
        code: 200,
        message: '用户修改成功',
        data: {
          user: result.user
        }
      });

    } catch (error) {
      console.error('修改用户失败:', error);
      res.status(500).json({
        code: 500,
        message: '修改用户失败',
        data: null
      });
    }
  }
}

module.exports = AdminUserController;