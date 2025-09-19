const AdPlan = require('../models/adPlan');
const AdGroup = require('../models/adGroup');
const knex = require('../models/knex');

class AdPlanService {
  /**
   * 获取广告计划列表（支持分页和搜索）
   * @param {Object} params 查询参数
   * @param {number} params.page 页码，默认1
   * @param {number} params.pageSize 每页数量，默认10
   * @param {string} params.name 广告计划名称和ID搜索
   * @param {number} params.status 状态筛选
   * @returns {Promise<Object>} 分页结果
   */
  static async getAdPlanList(params = {}) {
    const { page = 1, pageSize = 10, name, status, accountId } = params;
    
    // 构建基础查询
    let query = knex('ad_plan');
    
    // 按accountId过滤
    if (accountId) {
      query = query.where('account_id', parseInt(accountId));
    }
    
    // 按名称和ID搜索
    if (name && name.trim()) {
      const searchTerm = name.trim();
      const isNumeric = !isNaN(searchTerm) && !isNaN(parseFloat(searchTerm));
      
      query = query.where(function() {
        // 搜索名称（模糊匹配）
        this.where('name', 'like', `%${searchTerm}%`);
        
        // 如果搜索词是数字，也搜索ID（精确匹配）
        if (isNumeric) {
          this.orWhere('id', parseInt(searchTerm));
        }
      });
    }
    
    // 按状态筛选
    if (status !== undefined && status !== null && status !== '') {
      query = query.where('status', parseInt(status));
    }
    
    // 获取总数 - 重新构建查询以避免GROUP BY错误
    let countQuery = knex('ad_plan');
    
    // 添加与主查询相同的筛选条件
    if (accountId) {
      countQuery = countQuery.where('account_id', parseInt(accountId));
    }
    
    if (name && name.trim()) {
      const searchTerm = name.trim();
      const isNumeric = !isNaN(searchTerm) && !isNaN(parseFloat(searchTerm));
      
      countQuery = countQuery.where(function() {
        // 搜索名称（模糊匹配）
        this.where('name', 'like', `%${searchTerm}%`);
        
        // 如果搜索词是数字，也搜索ID（精确匹配）
        if (isNumeric) {
          this.orWhere('id', parseInt(searchTerm));
        }
      });
    }
    
    if (status !== undefined && status !== null && status !== '') {
      countQuery = countQuery.where('status', parseInt(status));
    }

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
        'ad_plan.created_at',
        'ad_plan.updated_at'
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
   * 获取广告组列表（支持搜索）
   * @param {Object} params - 查询参数
   * @param {string} params.name - 搜索关键词，同时搜索ID和名称
   * @param {number} params.accountId - 账户ID过滤
   * @returns {Promise<Object>} 广告组列表
   */
  static async getAdGroupList(params = {}) {
    const { name, accountId } = params;

    // 构建基础查询
    let query = knex('ad_group')
      .select('id', 'name')
      .orderBy('id', 'desc');

    // 按accountId过滤
    if (accountId) {
      query = query.where('account_id', parseInt(accountId));
    }

    // 添加搜索条件（同时搜索ID和名称）
    if (name && name.trim()) {
      const searchTerm = name.trim();
      const isNumeric = !isNaN(searchTerm) && !isNaN(parseFloat(searchTerm));
      
      query = query.where(function() {
        // 搜索名称（模糊匹配）
        this.where('name', 'like', `%${searchTerm}%`);
        
        // 如果搜索词是数字，也搜索ID（精确匹配）
        if (isNumeric) {
          this.orWhere('id', parseInt(searchTerm));
        }
      });
    }

    // 执行查询获取所有数据
    const adGroups = await query;

    // 获取广告组关联的广告计划
    const adGroupIds = adGroups.map(group => group.id);
    let adGroupPlans = [];
    
    if (adGroupIds.length > 0) {
      let planQuery = knex('ad_plan_ad_group')
        .join('ad_plan', 'ad_plan_ad_group.ad_plan_id', 'ad_plan.id')
        .whereIn('ad_plan_ad_group.ad_group_id', adGroupIds);

      // 如果有accountId过滤，也要过滤关联的广告计划
      if (accountId) {
        planQuery = planQuery.where('ad_plan.account_id', parseInt(accountId));
      }

      adGroupPlans = await planQuery.select(
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
        'ad_plan.created_at',
        'ad_plan.updated_at'
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

    return {
      ad_groups: result
    };
  }
}

module.exports = AdPlanService;