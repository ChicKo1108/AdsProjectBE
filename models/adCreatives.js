const Base = require('./base');

class AdCreatives extends Base {
  constructor() {
    super('ad_creatives');
  }

  async findByName(name) {
    return this.query().where({ name }).first();
  }

  async findByDisplayId(displayId) {
    return this.query().where({ display_id: displayId }).first();
  }

  async findByStatus(status) {
    return this.query().where({ status });
  }

  async findByBudgetRange(min, max) {
    return this.query().whereBetween('budget', [min, max]);
  }

  async findByDownloadCostRange(min, max) {
    return this.query().whereBetween('download_cost', [min, max]);
  }

  async findByClickCostRange(min, max) {
    return this.query().whereBetween('click_cost', [min, max]);
  }

  async findByCostsRange(min, max) {
    return this.query().whereBetween('costs', [min, max]);
  }

  async findByDownloadCountRange(min, max) {
    return this.query().whereBetween('download_count', [min, max]);
  }

  async findByDownloadRateRange(min, max) {
    return this.query().whereBetween('download_rate', [min, max]);
  }

  async findByEcpmRange(min, max) {
    return this.query().whereBetween('ecpm', [min, max]);
  }

  async findByDisplayCountRange(min, max) {
    return this.query().whereBetween('display_count', [min, max]);
  }

  async findByClickCountRange(min, max) {
    return this.query().whereBetween('click_count', [min, max]);
  }

  async findByClickRateRange(min, max) {
    return this.query().whereBetween('click_reate', [min, max]);
  }

  async updateStatus(id, status) {
    return this.update(id, { status });
  }

  async updateBudget(id, budget) {
    return this.update(id, { budget });
  }

  async updateDownloadCost(id, downloadCost) {
    return this.update(id, { download_cost: downloadCost });
  }

  async updateClickCost(id, clickCost) {
    return this.update(id, { click_cost: clickCost });
  }

  async updateCosts(id, costs) {
    return this.update(id, { costs });
  }

  async updateDownloadCount(id, downloadCount) {
    return this.update(id, { download_count: downloadCount });
  }

  async updateDownloadRate(id, downloadRate) {
    return this.update(id, { download_rate: downloadRate });
  }

  async updateEcpm(id, ecpm) {
    return this.update(id, { ecpm });
  }

  async updateDisplayCount(id, displayCount) {
    return this.update(id, { display_count: displayCount });
  }

  async updateClickCount(id, clickCount) {
    return this.update(id, { click_count: clickCount });
  }

  async updateClickRate(id, clickRate) {
    return this.update(id, { click_rate: clickRate });
  }

  // Account关联方法
  async findByAccountId(accountId) {
    return this.query().where({ account_id: accountId });
  }

  async getAccount(id) {
    const Account = require('./account');
    const adCreatives = await this.findById(id);
    if (!adCreatives) return null;
    return Account.findById(adCreatives.account_id);
  }

  async createWithAccount(data, accountId) {
    return this.create({ ...data, account_id: accountId });
  }

  async updateAccount(id, accountId) {
    return this.update(id, { account_id: accountId });
  }
}

module.exports = new AdCreatives();