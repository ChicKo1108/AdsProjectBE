const AdPlan = require("../models/adPlan");
const AdPlanService = require("../services/adPlanService");
const ResponseUtils = require("../utils/responseUtils");

class AdPlanController {
  /**
   * 获取广告计划列表
   */
  static async getAdPlanList(req, res) {
    try {
      // 获取查询参数
      const { page, pageSize, name, status, accountId } = req.query;

      // 参数验证
      const queryParams = {};

      if (page) {
        const pageNum = parseInt(page);
        if (isNaN(pageNum) || pageNum < 1) {
          return ResponseUtils.badRequest(res, "页码必须是大于0的整数");
        }
        queryParams.page = pageNum;
      }

      if (pageSize) {
        const pageSizeNum = parseInt(pageSize);
        if (isNaN(pageSizeNum) || pageSizeNum < 1) {
          return ResponseUtils.badRequest(res, "每页数量必须是大于0的整数");
        }
        queryParams.pageSize = pageSizeNum;
      }

      if (name) {
        queryParams.name = name.trim();
      }

      if (status !== undefined && status !== "") {
        const statusNum = parseInt(status);
        if (isNaN(statusNum)) {
          return ResponseUtils.badRequest(res, "状态必须是数字");
        }
        queryParams.status = statusNum;
      }

      // 添加accountId过滤
      if (accountId) {
        const accountIdNum = parseInt(accountId);
        if (isNaN(accountIdNum)) {
          return ResponseUtils.badRequest(res, "账户ID必须是数字");
        }
        queryParams.accountId = accountIdNum;
      }

      // 调用service获取分页数据
      const result = await AdPlanService.getAdPlanList(queryParams);

      return ResponseUtils.success(res, 200, "获取成功", result);
    } catch (error) {
      console.error("获取广告计划列表失败:", error);
      return ResponseUtils.serverError(res, "获取广告计划列表失败");
    }
  }

  /**
   * 获取广告计划详情
   */
  static async getAdPlanDetail(req, res) {
    try {
      const { id } = req.params;
      const { accountId } = req.query;

      // 验证ID参数
      if (!id || isNaN(parseInt(id))) {
        return ResponseUtils.badRequest("无效的广告计划ID");
      }

      // 验证accountId参数
      if (accountId && isNaN(parseInt(accountId))) {
        return ResponseUtils.badRequest(res, "账户ID必须是数字");
      }

      // 获取所有广告计划并找到指定ID的计划
      const adPlan = await AdPlan.findById(parseInt(id));

      if (!adPlan) {
        return ResponseUtils.notFound("广告计划不存在");
      }

      // 如果提供了accountId，检查是否匹配
      if (accountId && adPlan.account_id !== parseInt(accountId)) {
        return ResponseUtils.notFound(res, "广告计划不存在");
      }

      return ResponseUtils.success(res, 200, "获取成功", {
        adPlan,
      });
    } catch (error) {
      console.error("获取广告计划详情失败:", error);
      return ResponseUtils.serverError(res, "获取广告计划详情失败");
    }
  }

  /**
   * 获取广告组列表
   * 包含每个广告组关联的广告计划，支持分页和搜索
   */
  static async getAdGroupList(req, res) {
    try {
      // 获取查询参数
      const { name, accountId } = req.query;

      // 参数验证
      const queryParams = {};

      if (name) {
        queryParams.name = name.trim();
      }

      // 添加accountId过滤
      if (accountId) {
        const accountIdNum = parseInt(accountId);
        if (isNaN(accountIdNum)) {
          return ResponseUtils.badRequest(res, "账户ID必须是数字");
        }
        queryParams.accountId = accountIdNum;
      }

      // 调用service获取所有数据（不分页）
      const result = await AdPlanService.getAdGroupList(queryParams);
      return ResponseUtils.success(res, 200, "获取成功", result);

    } catch (error) {
      console.error("获取广告组列表失败:", error);
      return ResponseUtils.serverError(res, "获取广告组列表失败");
    }
  }
}

module.exports = AdPlanController;
