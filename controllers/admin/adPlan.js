const AdminAdPlanService = require("../../services/admin/adPlanService");
const {
  isAdmin,
  checkAdPlanFieldPermissions,
} = require("../../utils/permissionUtils");
const {
  AD_PLAN_ENUMS,
  getEnumValues,
  isValidEnumValue,
} = require("../../utils/constants");
const ResponseUtils = require("../../utils/responseUtils");

class AdminAdPlanController {
  /**
   * 新建广告计划
   * ad_operator可以创建广告计划，但只能设置基本字段
   * site_admin可以设置所有字段
   */
  static async createAdPlan(req, res) {
    try {
      const {
        name,
        plan_type,
        target,
        price_stratagy,
        placement_type,
        status,
        chuang_yi_you_xuan,
        budget,
        cost,
        display_count,
        click_count,
        download_count,
        click_per_price,
        click_rate,
        ecpm,
        download_per_count,
        download_rate,
        start_date,
        end_date,
        accountId,
      } = req.body;

      // 检查字段级权限
      const requestedFields = Object.keys(req.body);
      const permissionCheck = await checkAdPlanFieldPermissions(
        req.user,
        requestedFields,
        accountId
      );

      if (!permissionCheck.hasPermission) {
        return ResponseUtils.forbidden(
          res,
          `权限不足，无法设置以下字段: ${permissionCheck.restrictedFields.join(
            ", "
          )}`
        );
      }

      // 参数验证
      if (!name || !name.trim()) {
        return ResponseUtils.badRequest("广告计划名称不能为空");
      }

      if (!plan_type || !plan_type.trim()) {
        return ResponseUtils.badRequest("计划类型不能为空");
      }

      if (!target || !target.trim()) {
        return ResponseUtils.badRequest("目标不能为空");
      }

      // 验证accountId参数
      if (accountId && isNaN(parseInt(accountId))) {
        return ResponseUtils.badRequest(res, "账户ID必须是数字");
      }

      // 验证target枚举值
      if (!isValidEnumValue(AD_PLAN_ENUMS.TARGET, target)) {
        return ResponseUtils.badRequest(
          "目标值无效，必须是: " +
            getEnumValues(AD_PLAN_ENUMS.TARGET).join(", ")
        );
      }

      if (!price_stratagy || !price_stratagy.trim()) {
        return ResponseUtils.badRequest("价格策略不能为空");
      }

      // 验证price_stratagy枚举值
      if (!isValidEnumValue(AD_PLAN_ENUMS.PRICE_STRATEGY, price_stratagy)) {
        return ResponseUtils.badRequest(
          "价格策略无效，必须是: " +
            getEnumValues(AD_PLAN_ENUMS.PRICE_STRATEGY).join(", ")
        );
      }

      if (!placement_type || !placement_type.trim()) {
        return ResponseUtils.badRequest("投放类型不能为空");
      }

      // 构建创建数据，只包含用户有权限设置的字段
      const createData = {
        name: name.trim(),
        plan_type: plan_type.trim(),
        target,
        price_stratagy,
        placement_type: placement_type.trim(),
        status: status || 0,
        chuang_yi_you_xuan: chuang_yi_you_xuan || 0,
        budget: budget || 0,
        start_date,
        end_date,
      };

      // 添加accountId到创建数据
      if (accountId) {
        createData.account_id = parseInt(accountId);
      }

      // 只有site_admin可以设置统计字段
      if (req.user.role === "site_admin") {
        if (cost !== undefined) createData.cost = cost;
        if (display_count !== undefined)
          createData.display_count = display_count;
        if (click_count !== undefined) createData.click_count = click_count;
        if (download_count !== undefined)
          createData.download_count = download_count;
        if (click_per_price !== undefined)
          createData.click_per_price = click_per_price;
        if (click_rate !== undefined) createData.click_rate = click_rate;
        if (ecpm !== undefined) createData.ecpm = ecpm;
        if (download_per_count !== undefined)
          createData.download_per_count = download_per_count;
        if (download_rate !== undefined)
          createData.download_rate = download_rate;
      }

      // 调用服务层创建广告计划
      const result = await AdminAdPlanService.createAdPlan(createData);

      if (!result.success) {
        return ResponseUtils.forbidden(res, result.message);
      }

      ResponseUtils.success(res, 201, "创建成功", result);
    } catch (error) {
      console.error("创建广告计划失败:", error);
      return ResponseUtils.serverError(res, "创建广告计划失败");
    }
  }

  /**
   * 修改广告计划
   * 实现字段级权限控制
   */
  static async updateAdPlan(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        plan_type,
        target,
        price_stratagy,
        placement_type,
        status,
        chuang_yi_you_xuan,
        budget,
        cost,
        display_count,
        click_count,
        download_count,
        click_per_price,
        click_rate,
        ecpm,
        download_per_count,
        download_rate,
        start_date,
        end_date,
        accountId,
      } = req.body;

      // 参数验证
      if (!id || isNaN(parseInt(id))) {
        return ResponseUtils.badRequest("广告计划ID无效");
      }

      // 验证accountId参数
      if (accountId && isNaN(parseInt(accountId))) {
        return ResponseUtils.badRequest(res, "账户ID必须是数字");
      }

      // 验证必填字段
      if (name !== undefined && (!name || !name.trim())) {
        return ResponseUtils.badRequest("广告计划名称不能为空");
      }

      if (plan_type !== undefined && (!plan_type || !plan_type.trim())) {
        return ResponseUtils.badRequest("计划类型不能为空");
      }

      if (
        placement_type !== undefined &&
        (!placement_type || !placement_type.trim())
      ) {
        return ResponseUtils.badRequest("投放类型不能为空");
      }

      // 验证target枚举值
      if (target !== undefined) {
        if (!target || !target.trim()) {
          return ResponseUtils.badRequest("目标不能为空");
        }
        if (!isValidEnumValue(AD_PLAN_ENUMS.TARGET, target)) {
          return ResponseUtils.badRequest(
            "目标值无效，必须是: " +
              getEnumValues(AD_PLAN_ENUMS.TARGET).join(", ")
          );
        }
      }

      // 验证price_stratagy枚举值
      if (price_stratagy !== undefined) {
        if (!price_stratagy || !price_stratagy.trim()) {
          return ResponseUtils.badRequest("价格策略不能为空");
        }
        if (!isValidEnumValue(AD_PLAN_ENUMS.PRICE_STRATEGY, price_stratagy)) {
          return ResponseUtils.badRequest(
            "价格策略无效，必须是: " +
              getEnumValues(AD_PLAN_ENUMS.PRICE_STRATEGY).join(", ")
          );
        }
      }

      // 构建更新数据，只包含用户有权限修改的字段
      const updateData = {};

      // ad_operator和site_admin都可以修改的字段
      if (name !== undefined) updateData.name = name.trim();
      if (plan_type !== undefined) updateData.plan_type = plan_type.trim();
      if (target !== undefined) updateData.target = target;
      if (price_stratagy !== undefined)
        updateData.price_stratagy = price_stratagy;
      if (placement_type !== undefined)
        updateData.placement_type = placement_type.trim();
      if (status !== undefined) updateData.status = status;
      if (chuang_yi_you_xuan !== undefined)
        updateData.chuang_yi_you_xuan = chuang_yi_you_xuan;
      if (budget !== undefined) updateData.budget = budget;
      if (start_date !== undefined) updateData.start_date = start_date;
      if (end_date !== undefined) updateData.end_date = end_date;

      // 只有site_admin可以修改的统计字段
      if (req.user.role === "site_admin") {
        if (cost !== undefined) updateData.cost = cost;
        if (display_count !== undefined)
          updateData.display_count = display_count;
        if (click_count !== undefined) updateData.click_count = click_count;
        if (download_count !== undefined)
          updateData.download_count = download_count;
        if (click_per_price !== undefined)
          updateData.click_per_price = click_per_price;
        if (click_rate !== undefined) updateData.click_rate = click_rate;
        if (ecpm !== undefined) updateData.ecpm = ecpm;
        if (download_per_count !== undefined)
          updateData.download_per_count = download_per_count;
        if (download_rate !== undefined)
          updateData.download_rate = download_rate;
      }

      // 调用服务层修改广告计划
      const result = await AdminAdPlanService.updateAdPlan(
        parseInt(id),
        updateData
      );

      if (!result.success) {
        return ResponseUtils.forbidden(res, result.message);
      }

      return ResponseUtils.success(res, 200, "广告计划修改成功", {
        ad_plan: result.ad_plan,
      });
    } catch (error) {
      console.error("修改广告计划失败:", error);
      return ResponseUtils.serverError(res, "修改广告计划失败");
    }
  }

  /**
   * 绑定广告组
   */
  static async bindAdGroups(req, res) {
    try {
      const { id } = req.params;
      const { ad_group_ids } = req.body;

      // 参数验证
      if (!id || isNaN(parseInt(id))) {
        return ResponseUtils.badRequest("广告计划ID无效");
      }

      // 如果ad_group_ids为空或null，表示不绑定任何广告组
      if (ad_group_ids !== null && ad_group_ids !== undefined) {
        if (!Array.isArray(ad_group_ids)) {
          return ResponseUtils.badRequest("广告组ID列表必须为数组格式");
        }

        // 验证广告组ID格式（如果数组不为空）
        if (ad_group_ids.length > 0) {
          const invalidIds = ad_group_ids.filter(
            (adGroupId) => !Number.isInteger(adGroupId) || adGroupId <= 0
          );
          if (invalidIds.length > 0) {
            return ResponseUtils.badRequest(
              "广告组ID列表包含无效值: " + invalidIds.join(", ")
            );
          }
        }
      }

      // 调用服务层绑定广告组
      const result = await AdminAdPlanService.bindAdGroups(
        parseInt(id),
        ad_group_ids
      );

      if (!result.success) {
        return ResponseUtils.forbidden(res, result.message);
      }

      return ResponseUtils.success(res, 200, "广告组绑定成功", {
        ad_plan: result.ad_plan,
      });
    } catch (error) {
      console.error("绑定广告组失败:", error);
      return ResponseUtils.serverError(res);
    }
  }

  /**
   * 批量绑定广告计划到广告组
   */
  static async batchBindAdPlansToAdGroups(req, res) {
    try {
      const { ad_plan_ids, ad_group_ids } = req.body;

      // 参数验证
      if (!Array.isArray(ad_plan_ids) || ad_plan_ids.length === 0) {
        return ResponseUtils.badRequest(
          res,
          "广告计划ID列表不能为空且必须为数组格式"
        );
      }

      if (!Array.isArray(ad_group_ids) || ad_group_ids.length === 0) {
        return ResponseUtils.badRequest(
          res,
          "广告组ID列表不能为空且必须为数组格式"
        );
      }

      // 验证广告计划ID格式
      const invalidPlanIds = ad_plan_ids.filter(
        (planId) => !Number.isInteger(planId) || planId <= 0
      );
      if (invalidPlanIds.length > 0) {
        return ResponseUtils.badRequest(
          res,
          "广告计划ID列表包含无效值: " + invalidPlanIds.join(", ")
        );
      }

      // 验证广告组ID格式
      const invalidGroupIds = ad_group_ids.filter(
        (groupId) => !Number.isInteger(groupId) || groupId <= 0
      );
      if (invalidGroupIds.length > 0) {
        return ResponseUtils.badRequest(
          res,
          "广告组ID列表包含无效值: " + invalidGroupIds.join(", ")
        );
      }

      // 调用服务层批量绑定
      const result = await AdminAdPlanService.batchBindAdPlansToAdGroups(
        ad_plan_ids,
        ad_group_ids
      );

      if (!result.success) {
        return ResponseUtils.badRequest(res, result.message);
      }

      return ResponseUtils.success(res, 200, "批量绑定成功", {
        bound_count: result.bound_count,
        details: result.details,
      });
    } catch (error) {
      console.error("批量绑定广告计划到广告组失败:", error);
      return ResponseUtils.serverError(res, "服务器内部错误");
    }
  }

  /**
   * 解绑广告计划
   */
  static async unbindAdPlan(req, res) {
    try {
      const { ad_plan_id, ad_group_id } = req.body;

      // 参数验证
      if (!ad_plan_id || !Number.isInteger(ad_plan_id) || ad_plan_id <= 0) {
        return ResponseUtils.badRequest(res, "广告计划ID无效");
      }

      if (!ad_group_id || !Number.isInteger(ad_group_id) || ad_group_id <= 0) {
        return ResponseUtils.badRequest(res, "广告组ID无效");
      }

      // 调用服务层解绑
      const result = await AdminAdPlanService.unbindAdPlan(
        ad_plan_id,
        ad_group_id
      );

      if (!result.success) {
        return ResponseUtils.badRequest(res, result.message);
      }

      return ResponseUtils.success(res, 200, result.message);
    } catch (error) {
      console.error("解绑广告计划失败:", error);
      return ResponseUtils.serverError(res, "服务器内部错误");
    }
  }

  /**
   * 删除广告计划
   */
  static async deleteAdPlan(req, res) {
    try {
      const { id } = req.params;
      const { accountId } = req.query;

      // 参数验证
      if (!id || isNaN(parseInt(id))) {
        return ResponseUtils.badRequest("广告计划ID无效");
      }

      // 验证accountId参数
      if (accountId && isNaN(parseInt(accountId))) {
        return ResponseUtils.badRequest(res, "账户ID必须是数字");
      }

      const result = await AdminAdPlanService.deleteAdPlan(
        parseInt(id),
        accountId ? parseInt(accountId) : null
      );

      if (result.success) {
        return ResponseUtils.success(res, 200, result.message);
      } else {
        return ResponseUtils.forbidden(res, result.message);
      }
    } catch (error) {
      console.error("删除广告计划失败:", error);
      return ResponseUtils.serverError(res);
    }
  }

  /**
   * 删除广告组
   */
  static async deleteAdGroup(req, res) {
    try {
      const { id } = req.params;
      const { accountId } = req.query;

      // 参数验证
      if (!id || isNaN(parseInt(id))) {
        return ResponseUtils.badRequest(res, "广告组ID无效");
      }

      // 验证accountId参数
      if (accountId && isNaN(parseInt(accountId))) {
        return ResponseUtils.badRequest(res, "账户ID必须是数字");
      }

      // 调用服务层删除广告组
      const result = await AdminAdPlanService.deleteAdGroup(
        parseInt(id),
        accountId ? parseInt(accountId) : null
      );

      if (!result.success) {
        return ResponseUtils.badRequest(res, result.message);
      }

      return ResponseUtils.success(res, 200, result.message);
    } catch (error) {
      console.error("删除广告组失败:", error);
      return ResponseUtils.serverError(res, "服务器内部错误");
    }
  }

  /**
   * 删除广告组
   */
  static async deleteAdGroups(req, res) {
    try {
      const { id } = req.params;
      const { ad_group_ids } = req.body;

      // 参数验证
      if (!id || isNaN(parseInt(id))) {
        return ResponseUtils.badRequest("广告计划ID无效");
      }

      // 验证广告组ID格式
      const invalidIds = ad_group_ids.filter(
        (adGroupId) => !Number.isInteger(adGroupId) || adGroupId <= 0
      );
      if (invalidIds.length > 0) {
        return ResponseUtils.badRequest(
          "广告组ID列表包含无效值: " + invalidIds.join(", ")
        );
      }

      const result = await AdminAdPlanService.deleteAdGroups(
        parseInt(id),
        ad_group_ids
      );

      if (result.success) {
        return ResponseUtils.success(res, 200, result.message, data);
      } else {
        return ResponseUtils.forbidden(res, result.message);
      }
    } catch (error) {
      console.error("删除广告组失败:", error);
      return ResponseUtils.serverError(res);
    }
  }

  /**
   * 新建广告组
   */
  static async createAdGroup(req, res) {
    try {
      const { name, accountId } = req.body;

      // 参数验证
      if (!name || !name.trim()) {
        return ResponseUtils.badRequest(res, "广告组名称不能为空");
      }

      // 验证accountId参数
      if (accountId && isNaN(parseInt(accountId))) {
        return ResponseUtils.badRequest(res, "账户ID必须是数字");
      }

      // 调用服务层创建广告组
      const result = await AdminAdPlanService.createAdGroup({
        name: name.trim(),
        account_id: accountId ? parseInt(accountId) : null,
      });

      if (!result.success) {
        return ResponseUtils.badRequest(res, result.message);
      }

      return ResponseUtils.created(res, "广告组创建成功", {
        ad_group: result.ad_group,
      });
    } catch (error) {
      console.error("创建广告组失败:", error);
      return ResponseUtils.serverError(res, "服务器内部错误");
    }
  }

  /**
   * 修改广告组
   */
  static async updateAdGroup(req, res) {
    try {
      const { id } = req.params;
      const { name, accountId } = req.body;

      // 参数验证
      if (!id || isNaN(parseInt(id))) {
        return ResponseUtils.badRequest(res, "广告组ID无效");
      }

      if (!name || !name.trim()) {
        return ResponseUtils.badRequest(res, "广告组名称不能为空");
      }

      // 验证accountId参数
      if (accountId && isNaN(parseInt(accountId))) {
        return ResponseUtils.badRequest(res, "账户ID必须是数字");
      }

      // 调用服务层修改广告组
      const updateData = {
        name: name.trim(),
      };

      if (accountId) {
        updateData.account_id = parseInt(accountId);
      }

      const result = await AdminAdPlanService.updateAdGroup(
        parseInt(id),
        updateData
      );

      if (!result.success) {
        return ResponseUtils.badRequest(res, result.message);
      }

      return ResponseUtils.success(res, 200, "广告组修改成功", {
        ad_group: result.ad_group,
      });
    } catch (error) {
      console.error("修改广告组失败:", error);
      return ResponseUtils.serverError(res, "服务器内部错误");
    }
  }

  /**
   * 删除广告组
   */
}

module.exports = AdminAdPlanController;
