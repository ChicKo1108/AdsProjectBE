const AdPlan = require('../models/adPlan');
const AdPlanService = require('../services/adPlanService');

class AdPlanController {
  /**
   * 获取广告计划列表
   */
  static async getAdPlanList(req, res) {
    try {
      // 获取查询参数
      const { page, pageSize, name, status } = req.query;
      
      // 参数验证
      const queryParams = {};
      
      if (page) {
        const pageNum = parseInt(page);
        if (isNaN(pageNum) || pageNum < 1) {
          return res.status(400).json({
            code: 400,
            message: '页码必须是大于0的整数',
            data: null
          });
        }
        queryParams.page = pageNum;
      }
      
      if (pageSize) {
        const pageSizeNum = parseInt(pageSize);
        if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 100) {
          return res.status(400).json({
            code: 400,
            message: '每页数量必须是1-100之间的整数',
            data: null
          });
        }
        queryParams.pageSize = pageSizeNum;
      }
      
      if (name) {
        queryParams.name = name.trim();
      }
      
      if (status !== undefined && status !== '') {
        const statusNum = parseInt(status);
        if (isNaN(statusNum)) {
          return res.status(400).json({
            code: 400,
            message: '状态必须是数字',
            data: null
          });
        }
        queryParams.status = statusNum;
      }
      
      // 调用service获取分页数据
      const result = await AdPlanService.getAdPlanList(queryParams);

      res.json({
        code: 200,
        message: 'success',
        data: result
      });

    } catch (error) {
      console.error('获取广告计划列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取广告计划列表失败',
        data: null
      });
    }
  }

  /**
   * 获取广告计划详情
   */
  static async getAdPlanDetail(req, res) {
    try {
      const { id } = req.params;

      // 验证ID参数
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: '无效的广告计划ID'
        });
      }

      // 获取所有广告计划并找到指定ID的计划
      const adPlan = await AdPlan.findById(parseInt(id));

      if (!adPlan) {
        return res.status(404).json({
          success: false,
          message: '广告计划不存在'
        });
      }

      res.json({
        success: true,
        data: { adPlan }
      });

    } catch (error) {
      console.error('获取广告计划详情失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误',
        error: error.message
      });
    }
  }

  /**
   * 获取广告组列表
   * 包含每个广告组关联的广告计划，支持分页和搜索
   */
  static async getAdGroupList(req, res) {
    try {
      // 获取查询参数
      const { page, pageSize, name } = req.query;
      
      // 参数验证
      const queryParams = {};
      
      if (page) {
        const pageNum = parseInt(page);
        if (isNaN(pageNum) || pageNum < 1) {
          return res.status(400).json({
            code: 400,
            message: '页码必须是大于0的整数',
            data: null
          });
        }
        queryParams.page = pageNum;
      }
      
      if (pageSize) {
        const pageSizeNum = parseInt(pageSize);
        if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 100) {
          return res.status(400).json({
            code: 400,
            message: '每页数量必须是1-100之间的整数',
            data: null
          });
        }
        queryParams.pageSize = pageSizeNum;
      }
      
      if (name) {
        queryParams.name = name.trim();
      }
      
      // 调用service获取分页数据
      const result = await AdPlanService.getAdGroupList(queryParams);

      res.json({
        code: 200,
        message: 'success',
        data: result
      });
    } catch (error) {
      console.error('获取广告组列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取广告组列表失败',
        data: null
      });
    }
  }
}

module.exports = AdPlanController;