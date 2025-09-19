const Base = require('./base');

class AdGroup extends Base {
  constructor() {
    super('ad_group');
  }

  async findByName(name) {
    return this.query().where({ name }).first();
  }

  async updateName(id, name) {
    return this.update(id, { name });
  }

  // Account关联方法
  async findByAccountId(accountId) {
    return this.query().where({ account_id: accountId });
  }

  async getAccount(id) {
    const Account = require('./account');
    const adGroup = await this.findById(id);
    if (!adGroup) return null;
    return Account.findById(adGroup.account_id);
  }

  async createWithAccount(data, accountId) {
    return this.create({ ...data, account_id: accountId });
  }

  async updateAccount(id, accountId) {
    return this.update(id, { account_id: accountId });
  }
}

module.exports = new AdGroup();