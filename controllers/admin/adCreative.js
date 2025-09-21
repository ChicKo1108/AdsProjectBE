const AdminAdCreativeService = require("../../services/admin/adCreativeService");
const {
  isAdmin,
  checkAdCreativesFieldPermissions,
} = require("../../utils/permissionUtils");
const ResponseUtils = require("../../utils/responseUtils");

class AdminAdCreativeController {
  /**
   * 创建广告创意
   */
  static async createAdCreative(req, res) {
    try {
      const { accountId } = req.body;

      // 检查字段级权限
      const requestedFields = Object.keys(req.body);
      const permissionCheck = await checkAdCreativesFieldPermissions(
        req.user,
        requestedFields,
        accountId
      );

      if (!permissionCheck.hasPermission) {
        // 把没有操作权限的字段删除掉，然后继续创建
        const restrictedFields = permissionCheck.restrictedFields;
        for (const field of restrictedFields) {
          delete req.body[field];
        }
      }

      // 重新获取过滤后的字段列表
      const filteredFields = Object.keys(req.body);

      // 至少需要一个参数
      const hasCreateFields = filteredFields.length > 0;

      if (!hasCreateFields) {
        return ResponseUtils.badRequest(res, "至少需要提供一个要创建的字段");
      }

      // 参数验证 - 检查过滤后的字段
      if (req.body.name && (!req.body.name || !req.body.name.trim())) {
        return ResponseUtils.badRequest(res, "广告创意名称不能为空");
      }

      if (
        req.body.display_id &&
        (!req.body.display_id || !req.body.display_id.trim())
      ) {
        return ResponseUtils.badRequest(res, "Display ID不能为空");
      }

      if (
        req.body.status !== undefined &&
        req.body.status !== 0 &&
        req.body.status !== 1
      ) {
        return ResponseUtils.badRequest(res, "状态值必须为0或1");
      }

      // 验证accountId参数
      if (req.body.accountId && isNaN(parseInt(req.body.accountId))) {
        return ResponseUtils.badRequest(res, "账户ID必须是数字");
      }

      // 数值类型验证
      const numericFields = {
        budget: "预算",
        download_cost: "下载成本",
        click_cost: "点击成本",
        costs: "消耗金额",
        download_count: "下载量",
        download_rate: "下载率",
        ecpm: "ECPM",
        display_count: "曝光量",
        click_count: "点击量",
        click_rate: "点击率",
      };

      for (const [field, label] of Object.entries(numericFields)) {
        const value = req.body[field];
        if (
          value !== undefined &&
          value !== null &&
          (isNaN(value) || value < 0)
        ) {
          return ResponseUtils.badRequest(res, `${label}必须为非负数`);
        }
      }

      // 构建创建数据，只包含用户有权限设置的字段
      const createData = {};

      // 根据filteredFields判断哪些字段是ad_operator和site_admin都可以设置的，添加进createData
      for (const field of filteredFields) {
        if (req.body[field] !== undefined) {
          createData[field] = req.body[field];
        }
      }

      // 添加accountId到创建数据
      if (req.body.accountId) {
        createData.account_id = parseInt(req.body.accountId);
      }
      delete createData.accountId;
      const result = await AdminAdCreativeService.createAdCreative(createData);

      if (result.success) {
        return ResponseUtils.created(res, "广告创意创建成功", {
          ad_creative: result.data,
        });
      } else {
        return ResponseUtils.badRequest(res, result.message);
      }
    } catch (error) {
      console.error("创建广告创意失败:", error);
      return ResponseUtils.serverError(res, "服务器内部错误");
    }
  }

  /**
   * 修改广告创意
   */
  static async updateAdCreative(req, res) {
    try {
      const { id } = req.params;
      const { accountId } = req.body;

      // 参数验证
      if (!id || isNaN(parseInt(id))) {
        return ResponseUtils.badRequest(res, "广告创意ID无效");
      }

      // 验证accountId参数
      if (accountId && isNaN(parseInt(accountId))) {
        return ResponseUtils.badRequest(res, "账户ID必须是数字");
      }

      // 检查字段级权限
      const requestedFields = Object.keys(req.body);
      const permissionCheck = await checkAdCreativesFieldPermissions(
        req.user,
        requestedFields,
        accountId
      );

      if (!permissionCheck.hasPermission) {
        // 把没有操作权限的字段删除掉，然后继续编辑
        const restrictedFields = permissionCheck.restrictedFields;
        for (const field of restrictedFields) {
          delete req.body[field];
        }
      }

      // 重新获取过滤后的字段列表
      const filteredFields = Object.keys(req.body);

      // 至少需要一个参数
      const hasUpdateFields = filteredFields.length > 0;

      if (!hasUpdateFields) {
        return ResponseUtils.badRequest(res, "至少需要提供一个要修改的字段");
      }

      // 验证必填字段 - 检查过滤后的字段
      if (
        req.body.name !== undefined &&
        (!req.body.name || !req.body.name.trim())
      ) {
        return ResponseUtils.badRequest(res, "广告创意名称不能为空");
      }

      if (
        req.body.display_id !== undefined &&
        (!req.body.display_id || !req.body.display_id.trim())
      ) {
        return ResponseUtils.badRequest(res, "Display ID不能为空");
      }

      if (
        req.body.status !== undefined &&
        req.body.status !== 0 &&
        req.body.status !== 1
      ) {
        return ResponseUtils.badRequest(res, "状态值必须为0或1");
      }

      // 数值类型验证
      const numericFields = {
        budget: "预算",
        download_cost: "下载成本",
        click_cost: "点击成本",
        costs: "消耗金额",
        download_count: "下载量",
        download_rate: "下载率",
        ecpm: "ECPM",
        display_count: "曝光量",
        click_count: "点击量",
        click_rate: "点击率",
      };

      for (const [field, label] of Object.entries(numericFields)) {
        const value = req.body[field];
        if (
          value !== undefined &&
          value !== null &&
          (isNaN(value) || value < 0)
        ) {
          return ResponseUtils.badRequest(res, `${label}必须为非负数`);
        }
      }

      // 构建更新数据，只包含用户有权限修改的字段
      const updateData = {};

      // 根据filteredFields判断哪些字段是ad_operator和site_admin都可以修改的，添加进updateData
      for (const field of filteredFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      // 添加accountId到更新数据
      if (req.body.accountId) {
        updateData.account_id = parseInt(req.body.accountId);
      }

      delete updateData.accountId;

      const result = await AdminAdCreativeService.updateAdCreative(
        parseInt(id),
        updateData
      );

      if (result.success) {
        return ResponseUtils.success(res, 200, "广告创意修改成功", {
          ad_creative: result.data,
        });
      } else {
        return ResponseUtils.badRequest(res, result.message);
      }
    } catch (error) {
      console.error("修改广告创意失败:", error);
      return ResponseUtils.serverError(res, "服务器内部错误");
    }
  }

  /**
   * 删除广告创意
   */
  static async deleteAdCreative(req, res) {
    try {
      const { id } = req.params;
      const { accountId } = req.query;

      // 参数验证
      if (!id || isNaN(parseInt(id))) {
        return ResponseUtils.badRequest(res, "广告创意ID无效");
      }

      // 验证accountId参数
      if (accountId && isNaN(parseInt(accountId))) {
        return ResponseUtils.badRequest(res, "账户ID必须是数字");
      }

      const result = await AdminAdCreativeService.deleteAdCreative(
        parseInt(id),
        accountId ? parseInt(accountId) : null
      );

      if (result.success) {
        return ResponseUtils.success(res, 200, result.message);
      } else {
        return ResponseUtils.badRequest(res, result.message);
      }
    } catch (error) {
      console.error("删除广告创意失败:", error);
      return ResponseUtils.serverError(res, "服务器内部错误");
    }
  }
}

module.exports = AdminAdCreativeController;
