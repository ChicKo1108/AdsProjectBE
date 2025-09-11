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
}

module.exports = new AdGroup();