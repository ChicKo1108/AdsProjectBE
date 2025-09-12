const AdCreatives = require('../models/adCreatives');
const knex = require('../models/knex');

class AdCreativesService {
  /**
   * 获取所有广告创意
   * @returns {Promise<Array>} 广告创意列表
   */
  static async getAllAdCreatives() {
    return await AdCreatives.all();
  }

  /**
   * 获取广告创意列表（支持分页和搜索）
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码，默认为1
   * @param {number} params.pageSize - 每页数量，默认为10
   * @param {string} params.name - 广告创意名称搜索关键词
   * @param {number} params.status - 广告创意状态筛选
   * @returns {Promise<Object>} 分页的广告创意列表
   */
  static async getAdCreativesList(params = {}) {
    const { page = 1, pageSize = 10, name, status } = params;
    const offset = (page - 1) * pageSize;

    // 构建基础查询
    let query = knex('ad_creatives')
      .select('*')
      .orderBy('id', 'desc');

    // 添加名称搜索条件
    if (name && name.trim()) {
      query = query.where('name', 'like', `%${name.trim()}%`);
    }

    // 添加状态筛选条件
    if (status !== undefined && status !== null && status !== '') {
      query = query.where('status', status);
    }

    // 获取总数
    const countQuery = query.clone().count('* as total');
    const [{ total }] = await countQuery;

    // 执行分页查询
    const adCreatives = await query.limit(pageSize).offset(offset);

    const totalPages = Math.ceil(total / pageSize);

    return {
      ad_creatives: adCreatives,
      pagination: {
        page,
        pageSize,
        total: parseInt(total),
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * 根据ID获取广告创意详情
   * @param {number} id 广告创意ID
   * @returns {Promise<Object|null>} 广告创意详情或null
   */
  static async getAdCreativeById(id) {
    const adCreativesData = await AdCreatives.all();
    return adCreativesData.find(item => item.id === parseInt(id)) || null;
  }
}

module.exports = AdCreativesService;