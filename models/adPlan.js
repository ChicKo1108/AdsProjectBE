const Base = require('./base');

/**
 * AdPlan 模型类
 * @class
 * @extends Base
 * 
 * @property {string} table - 表名 ('AdPlan')
 * 
 * 表结构：
 * - id: number
 * - name: string // 计划名称
 * - plan_type: string // 计划类型
 * - target: enum(app, web, quick_app, mini_app, download) // 推广目标：应用推广-app, 网页推广-web, 快应用推广-quick_app, 小程序推广-mini_app, 应用下载-download
 * - price_stratagy: enum(stable_cost, max_conversion, optimal_cost) // 竞价策略：稳定成本-stable_cost, 最大转化-max_conversion, 最优成本-optimal_cost
 * - placement_type: string // 投放类型
 * - status: Number(0-草稿, 1-启用, 2-暂停, 3-结束)
 * - chuang_yi_you_xuan: number(0-未启动, 1-启动)
 * - budget: number // 预算
 * - cost: number // 花费
 * - display_count: number // 曝光量
 * - click_count: number // 点击量
 * - download_count: number // 下载量
 * - click_per_price: number // 点击均价
 * - click_rate: number // 点击率
 * - ecpm: number // ECPM
 * - download_per_count: number // 下载均价
 * - dounload_count: number // 下载率
 * - status: number
 */
class AdPlan extends Base {
  constructor() {
    super('ad_plan');
  }

  // 推广目标枚举
  static TARGET = {
    APP: 'app',                // 应用推广
    WEB: 'web',                // 网页推广
    QUICK_APP: 'quick_app',    // 快应用推广
    MINI_APP: 'mini_app',      // 小程序推广
    DOWNLOAD: 'download'       // 应用下载
  };

  // 竞价策略枚举
  static PRICE_STRATEGY = {
    STABLE_COST: 'stable_cost',        // 稳定成本
    MAX_CONVERSION: 'max_conversion',  // 最大转化
    OPTIMAL_COST: 'optimal_cost'       // 最优成本
  };

  // 状态枚举
  static STATUS = {
    DRAFT: 0,     // 草稿
    ACTIVE: 1,    // 启用
    PAUSED: 2,    // 暂停
    ENDED: 3      // 结束
  };

  // 创意优选枚举
  static CREATIVE_OPTIMIZATION = {
    DISABLED: 0,  // 未启动
    ENABLED: 1    // 启动
  };

  // 验证推广目标是否有效
  static isValidTarget(target) {
    return Object.values(this.TARGET).includes(target);
  }

  // 验证竞价策略是否有效
  static isValidPriceStrategy(priceStrategy) {
    return Object.values(this.PRICE_STRATEGY).includes(priceStrategy);
  }

  // 验证状态是否有效
  static isValidStatus(status) {
    return Object.values(this.STATUS).includes(status);
  }

  // 验证创意优选是否有效
  static isValidCreativeOptimization(value) {
    return Object.values(this.CREATIVE_OPTIMIZATION).includes(value);
  }

  // 获取所有有效的推广目标
  static getValidTargets() {
    return Object.values(this.TARGET);
  }

  // 获取所有有效的竞价策略
  static getValidPriceStrategies() {
    return Object.values(this.PRICE_STRATEGY);
  }

  async findById(id) {
    return this.query().where({ id }).first();
  }

  async findByName(name) {
    return this.query().where({ name }).first();
  }

  async findByPlanType(planType) {
    return this.query().where({ plan_type: planType });
  }

  async findByTarget(target) {
    return this.query().where({ target });
  }

  async findByPriceStrategy(priceStrategy) {
    return this.query().where({ price_stratagy: priceStrategy });
  }

  async findByPlacementType(placementType) {
    return this.query().where({ placement_type: placementType });
  }

  async findByStatus(status) {
    return this.query().where({ status });
  }

  async findByChuangYiYouXuan(chuangYiYouXuan) {
    return this.query().where({ chuang_yi_you_xuan: chuangYiYouXuan });
  }

  async findByBudgetRange(min, max) {
    return this.query().whereBetween('budget', [min, max]);
  }

  async findByCostRange(min, max) {
    return this.query().whereBetween('cost', [min, max]);
  }

  async findByBaoGuangCountRange(min, max) {
    return this.query().whereBetween('display_count', [min, max]);
  }

  async findByClickCountRange(min, max) {
    return this.query().whereBetween('click_count', [min, max]);
  }

  async findByDownloadCountRange(min, max) {
    return this.query().whereBetween('download_count', [min, max]);
  }

  async findByClickPerPriceRange(min, max) {
    return this.query().whereBetween('click_per_price', [min, max]);
  }

  async findByClickRateRange(min, max) {
    return this.query().whereBetween('click_rate', [min, max]);
  }

  async findByEcpmRange(min, max) {
    return this.query().whereBetween('ecpm', [min, max]);
  }

  async findByDownloadPerCountRange(min, max) {
    return this.query().whereBetween('download_per_count', [min, max]);
  }

  async findByDownloadCountRange(min, max) {
    return this.query().whereBetween('dounload_count', [min, max]);
  }

  async findByStartDateRange(start, end) {
    return this.query().whereBetween('start_date', [start, end]);
  }

  async findByEndDateRange(start, end) {
    return this.query().whereBetween('end_date', [start, end]);
  }

  async updateStatus(id, status) {
    return this.update(id, { status });
  }

  async updateBudget(id, budget) {
    return this.update(id, { budget });
  }

  async updateCost(id, cost) {
    return this.update(id, { cost });
  }

  async updateBaoGuangCount(id, baoGuangCount) {
    return this.update(id, { display_count: baoGuangCount });
  }

  async updateClickCount(id, clickCount) {
    return this.update(id, { click_count: clickCount });
  }

  async updateDownloadCount(id, downloadCount) {
    return this.update(id, { download_count: downloadCount });
  }

  async updateClickPerPrice(id, clickPerPrice) {
    return this.update(id, { click_per_price: clickPerPrice });
  }

  async updateClickRate(id, clickRate) {
    return this.update(id, { click_rate: clickRate });
  }

  async updateEcpm(id, ecpm) {
    return this.update(id, { ecpm });
  }

  async updateDownloadPerCount(id, downloadPerCount) {
    return this.update(id, { download_per_count: downloadPerCount });
  }

  async updateDownloadCount(id, downloadCount) {
    return this.update(id, { dounload_count: downloadCount });
  }

  async updateStartDate(id, startDate) {
    return this.update(id, { start_date: startDate });
  }

  async updateEndDate(id, endDate) {
    return this.update(id, { end_date: endDate });
  }
  
  async addAdGroup(adPlanId, adGroupId) {
    return this.knex('ad_plan_ad_group').insert({ ad_plan_id: adPlanId, ad_group_id: adGroupId });
  }

  async removeAdGroup(adPlanId, adGroupId) {
    return this.knex('ad_plan_ad_group').where({ ad_plan_id: adPlanId, ad_group_id: adGroupId }).del();
  }

  async getAdGroups(adPlanId) {
    const AdGroup = require('./adGroup');
    return AdGroup.query()
      .join('ad_plan_ad_group', 'ad_group.id', 'ad_plan_ad_group.ad_group_id')
      .where('ad_plan_ad_group.ad_plan_id', adPlanId);
  }

  // Account关联方法
  async findByAccountId(accountId) {
    return this.query().where({ account_id: accountId });
  }

  async getAccount(id) {
    const Account = require('./account');
    const adPlan = await this.findById(id);
    if (!adPlan) return null;
    return Account.findById(adPlan.account_id);
  }

  async createWithAccount(data, accountId) {
    return this.create({ ...data, account_id: accountId });
  }

  async updateAccount(id, accountId) {
    return this.update(id, { account_id: accountId });
  }
}

module.exports = new AdPlan();