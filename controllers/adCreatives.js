const AdCreativesService = require('../services/adCreativesService');

class AdCreativesController {
  /**
   * 获取广告创意列表（支持分页和搜索）
   */
  static async getAdCreativesList(req, res) {
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
      const result = await AdCreativesService.getAdCreativesList(queryParams);

      res.json({
        code: 200,
        message: 'success',
        data: result
      });
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

      if (!id) {
        return res.status(400).json({
          code: 400,
          message: '广告创意ID不能为空',
          data: null
        });
      }

      const adCreative = await AdCreativesService.getAdCreativeById(id);

      if (!adCreative) {
        return res.status(404).json({
          code: 404,
          message: '广告创意不存在',
          data: null
        });
      }

      res.json({
        code: 200,
        message: 'success',
        data: {
          ad_creative: adCreative
        }
      });
    } catch (error) {
      console.error('获取广告创意详情失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取广告创意详情失败',
        data: null
      });
    }
  }
}

module.exports = AdCreativesController;