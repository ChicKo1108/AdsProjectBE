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
 * - target: string(mobile_app-移动应用, game-游戏, ecommerce-电商, education-教育, finance-金融) // 推广目标
 * - price_stratagy: string(auto_bid-自动出价, manual_bid-手动出价) // 竞价策略
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
    return this.knex('ad_plan_ad_group')
      .where({ ad_plan_id: adPlanId })
      .join('ad_group', 'ad_plan_ad_group.ad_group_id', '=', 'ad_group.id')
      .select('ad_group.*');
  }
}

module.exports = new AdPlan();