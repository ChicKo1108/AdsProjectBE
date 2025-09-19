const AdCreativesService = require('../services/adCreativesService');
const ResponseUnits = require('../utils/responseUtils');

class AdCreativesController {
  /**
   * 获取广告创意列表（支持分页和搜索）
   */
  static async getAdCreativesList(req, res) {
    try {
      // 获取查询参数
      const { page, pageSize, name, status, accountId } = req.query;
      
      // 参数验证
      const queryParams = {};
      
      if (page) {
        const pageNum = parseInt(page);
        if (isNaN(pageNum) || pageNum < 1) {
          return ResponseUnits.badRequest(res, '页码必须是大于0的整数');
        }
        queryParams.page = pageNum;
      }
      
      if (pageSize) {
        const pageSizeNum = parseInt(pageSize);
        if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 100) {
          return ResponseUnits.badRequest(res, '每页数量必须是1-100之间的整数');
        }
        queryParams.pageSize = pageSizeNum;
      }
      
      if (name) {
        queryParams.name = name.trim();
      }
      
      if (status !== undefined && status !== '') {
        const statusNum = parseInt(status);
        if (isNaN(statusNum)) {
          return ResponseUnits.badRequest(res, '状态必须是数字');
        }
        queryParams.status = statusNum;
      }

      // 添加accountId过滤
      if (accountId) {
        const accountIdNum = parseInt(accountId);
        if (isNaN(accountIdNum)) {
          return ResponseUnits.badRequest(res, '账户ID必须是数字');
        }
        queryParams.accountId = accountIdNum;
      }
      
      // 调用service获取分页数据
      const result = await AdCreativesService.getAdCreativesList(queryParams);
      return ResponseUnits.success(res, 200, '获取成功', result);
    } catch (error) {
      console.error('获取广告创意列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取广告创意列表失败',
        data: null
      });
    }
  }

  /**
   * 获取广告创意详情
   */
  static async getAdCreativesDetail(req, res) {
    try {
      const { id } = req.params;
      const { accountId } = req.query;

      if (!id) {
        return ResponseUnits.badRequest(res, '广告创意ID不能为空');
      }

      // 验证accountId参数
      if (accountId && isNaN(parseInt(accountId))) {
        return ResponseUnits.badRequest(res, '账户ID必须是数字');
      }

      const adCreative = await AdCreativesService.getAdCreativeById(id);

      if (!adCreative) {
        return ResponseUnits.notFound(res, '广告创意不存在');
      }

      // 如果提供了accountId，检查是否匹配
      if (accountId && adCreative.account_id !== parseInt(accountId)) {
        return ResponseUnits.notFound(res, '广告创意不存在');
      }

      return ResponseUnits.success(res, 200, '获取成功', {
        adCreative
      });
    } catch (error) {
      console.error('获取广告创意详情失败:', error);
      return ResponseUnits.serverError(res, '获取广告创意详情失败');
    }
  }
}

module.exports = AdCreativesController;