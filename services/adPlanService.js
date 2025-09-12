const AdPlan = require('../models/adPlan');
const AdGroup = require('../models/adGroup');
const knex = require('../models/knex');

class AdPlanService {
  /**
   * 获取广告计划列表（支持分页和搜索）
   * @param {Object} params 查询参数
   * @param {number} params.page 页码，默认1
   * @param {number} params.pageSize 每页数量，默认10
   * @param {string} params.name 广告计划名称搜索
   * @param {number} params.status 状态筛选
   * @returns {Promise<Object>} 分页结果
   */
  static async getAdPlanList(params = {}) {
    const { page = 1, pageSize = 10, name, status } = params;
    
    // 构建基础查询
    let query = knex('ad_plan');
    
    // 按名称搜索
    if (name && name.trim()) {
      query = query.where('name', 'like', `%${name.trim()}%`);
    }
    
    // 按状态筛选
    if (status !== undefined && status !== null && status !== '') {
      query = query.where('status', parseInt(status));
    }
    
    // 获取总数
    const countQuery = query.clone();
    const [{ count }] = await countQuery.count('* as count');
    const total = parseInt(count);
    
    // 计算分页信息
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    
    // 执行分页查询，按ID倒序排序
    const adPlans = await query
      .orderBy('id', 'desc')
      .limit(pageSize)
      .offset(offset);
    
    return {
      ad_plans: adPlans,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * 获取广告组及其关联的广告计划
   * @returns {Promise<Array>} 广告组列表，包含关联的广告计划
   */
  static async getAdGroupsWithPlans() {
    // 获取所有广告组
    const adGroupsData = await AdGroup.all();

    // 获取广告组与广告计划的关联关系
    const adGroupPlans = await knex('ad_plan_ad_group')
      .join('ad_plan', 'ad_plan_ad_group.ad_plan_id', 'ad_plan.id')
      .select(
        'ad_plan_ad_group.ad_group_id',
        'ad_plan.id',
        'ad_plan.name',
        'ad_plan.plan_type',
        'ad_plan.target',
        'ad_plan.price_stratagy',
        'ad_plan.placement_type',
        'ad_plan.status',
        'ad_plan.chuang_yi_you_xuan',
        'ad_plan.budget',
        'ad_plan.cost',
        'ad_plan.display_count',
        'ad_plan.click_count',
        'ad_plan.download_count',
        'ad_plan.click_per_price',
        'ad_plan.click_rate',
        'ad_plan.ecpm',
        'ad_plan.download_per_count',
        'ad_plan.download_rate',
        'ad_plan.start_date',
        'ad_plan.end_date'
      );

    // 构造响应数据
    const adGroups = adGroupsData.map(group => {
      // 找到属于当前广告组的所有广告计划
      const groupPlans = adGroupPlans
        .filter(plan => plan.ad_group_id === group.id);

      return {
        id: group.id,
        name: group.name,
        ad_plans: groupPlans
      };
    });

    return adGroups;
  }

  /**
   * 获取广告组列表（支持分页和搜索）
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码，默认为1
   * @param {number} params.pageSize - 每页数量，默认为10
   * @param {string} params.name - 广告组名称搜索关键词
   * @returns {Promise<Object>} 分页的广告组列表
   */
  static async getAdGroupList(params = {}) {
    const { page = 1, pageSize = 10, name } = params;
    const offset = (page - 1) * pageSize;

    // 构建基础查询
    let query = knex('ad_group')
      .select('id', 'name')
      .orderBy('id', 'desc');

    // 添加名称搜索条件
    if (name && name.trim()) {
      query = query.where('name', 'like', `%${name.trim()}%`);
    }

    // 获取总数
    const countQuery = query.clone().count('* as total');
    const [{ total }] = await countQuery;

    // 执行分页查询
    const adGroups = await query.limit(pageSize).offset(offset);

    // 获取广告组关联的广告计划
    const adGroupIds = adGroups.map(group => group.id);
    let adGroupPlans = [];
    
    if (adGroupIds.length > 0) {
      adGroupPlans = await knex('ad_plan_ad_group')
        .join('ad_plan', 'ad_plan_ad_group.ad_plan_id', 'ad_plan.id')
        .whereIn('ad_plan_ad_group.ad_group_id', adGroupIds)
        .select(
          'ad_plan_ad_group.ad_group_id',
          'ad_plan.id',
          'ad_plan.name',
          'ad_plan.plan_type',
          'ad_plan.target',
          'ad_plan.price_stratagy',
          'ad_plan.placement_type',
          'ad_plan.status',
          'ad_plan.chuang_yi_you_xuan',
          'ad_plan.budget',
          'ad_plan.cost',
          'ad_plan.display_count',
          'ad_plan.click_count',
          'ad_plan.download_count',
          'ad_plan.click_per_price',
          'ad_plan.click_rate',
          'ad_plan.ecpm',
          'ad_plan.download_per_count',
          'ad_plan.download_rate',
          'ad_plan.start_date',
          'ad_plan.end_date'
        );
    }

    // 构造响应数据
    const result = adGroups.map(group => {
      // 找到属于当前广告组的所有广告计划
      const groupPlans = adGroupPlans
        .filter(plan => plan.ad_group_id === group.id);

      return {
        id: group.id,
        name: group.name,
        ad_plans: groupPlans
      };
    });

    const totalPages = Math.ceil(total / pageSize);

    return {
      ad_groups: result,
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
}

module.exports = AdPlanService;