const knex = require('../../models/knex');

class AdminAdCreativeService {
  /**
   * 创建广告创意
   * @param {Object} adCreativeData - 广告创意数据
   * @returns {Promise<Object>} 创建结果
   */
  static async createAdCreative(adCreativeData) {
    try {
      // 检查广告创意名称在当前账户下是否已存在
      const existingAdCreative = await knex('ad_creatives')
        .where('name', adCreativeData.name)
        .where('account_id', adCreativeData.account_id)
        .first();

      if (existingAdCreative) {
        return {
          success: false,
          message: '广告创意名称已存在'
        };
      }

      // 检查display_id是否已存在
      const existingDisplayId = await knex('ad_creatives')
        .where('display_id', adCreativeData.display_id)
        .where('account_id', adCreativeData.account_id)
        .first();

      if (existingDisplayId) {
        return {
          success: false,
          message: 'Display ID已存在'
        };
      }

      // 创建广告创意数据
      const newAdCreativeData = {
        ...adCreativeData,
        created_at: new Date(),
        updated_at: new Date()
      };

      // 插入广告创意到数据库
      const [adCreativeId] = await knex('ad_creatives').insert(newAdCreativeData);

      // 获取创建的广告创意信息
      const createdAdCreative = await knex('ad_creatives')
        .where('id', adCreativeId)
        .first();

      return {
        success: true,
        data: createdAdCreative
      };

    } catch (error) {
      console.error('创建广告创意时发生错误:', error);
      return {
        success: false,
        message: '创建广告创意时发生内部错误'
      };
    }
  }

  /**
   * 修改广告创意
   * @param {number} adCreativeId - 广告创意ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} 更新结果
   */
  static async updateAdCreative(adCreativeId, updateData) {
    const trx = await knex.transaction();
    
    try {
      // 检查广告创意是否存在
      const existingAdCreative = await trx('ad_creatives')
        .where('id', adCreativeId)
        .first();

      if (!existingAdCreative) {
        await trx.rollback();
        return {
          success: false,
          message: '广告创意不存在'
        };
      }

      // 如果更新名称，检查名称是否重复
      if (updateData.name && updateData.name !== existingAdCreative.name) {
        const duplicateName = await trx('ad_creatives')
          .where('name', updateData.name)
          .where('account_id', existingAdCreative.account_id)
          .where('id', '!=', adCreativeId)
          .first();

        if (duplicateName) {
          await trx.rollback();
          return {
            success: false,
            message: '广告创意名称已存在'
          };
        }
      }

      // 如果更新display_id，检查是否重复
      if (updateData.display_id && updateData.display_id !== existingAdCreative.display_id) {
        const duplicateDisplayId = await trx('ad_creatives')
          .where('display_id', updateData.display_id)
          .where('account_id', existingAdCreative.account_id)
          .where('id', '!=', adCreativeId)
          .first();

        if (duplicateDisplayId) {
          await trx.rollback();
          return {
            success: false,
            message: 'Display ID已存在'
          };
        }
      }

      // 更新广告创意数据
      const finalUpdateData = {
        ...updateData,
        updated_at: new Date()
      };

      await trx('ad_creatives')
        .where('id', adCreativeId)
        .update(finalUpdateData);

      // 获取更新后的广告创意信息
      const updatedAdCreative = await trx('ad_creatives')
        .where('id', adCreativeId)
        .first();

      await trx.commit();

      return {
        success: true,
        data: updatedAdCreative
      };

    } catch (error) {
      await trx.rollback();
      console.error('修改广告创意时发生错误:', error);
      return {
        success: false,
        message: '修改广告创意时发生内部错误'
      };
    }
  }

  /**
   * 删除广告创意
   * @param {number} adCreativeId - 广告创意ID
   * @returns {Promise<Object>} 删除结果
   */
  static async deleteAdCreative(adCreativeId) {
    try {
      // 检查广告创意是否存在
      const adCreative = await knex('ad_creatives')
        .where('id', adCreativeId)
        .first();

      if (!adCreative) {
        return {
          success: false,
          message: '广告创意不存在'
        };
      }

      // 删除广告创意
      await knex('ad_creatives')
        .where('id', adCreativeId)
        .del();

      return {
        success: true,
        message: '广告创意删除成功'
      };

    } catch (error) {
      console.error('删除广告创意时发生错误:', error);
      return {
        success: false,
        message: '删除广告创意时发生内部错误'
      };
    }
  }
}

module.exports = AdminAdCreativeService;