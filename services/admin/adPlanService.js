const knex = require('../../models/knex');

class AdminAdPlanService {
  /**
   * 创建广告计划
   * @param {Object} adPlanData - 广告计划数据
   * @returns {Promise<Object>} 创建结果
   */
  static async createAdPlan(adPlanData) {
    try {
      // 检查广告计划名称是否已存在
      const existingAdPlan = await knex('ad_plan')
        .where('name', adPlanData.name)
        .first();

      if (existingAdPlan) {
        return {
          success: false,
          message: '广告计划名称已存在'
        };
      }

      // 创建广告计划数据
      const newAdPlanData = {
        ...adPlanData,
        created_at: new Date(),
        updated_at: new Date()
      };

      // 插入广告计划到数据库
      const [adPlanId] = await knex('ad_plan').insert(newAdPlanData);

      // 获取创建的广告计划信息
      const createdAdPlan = await knex('ad_plan')
        .where('id', adPlanId)
        .first();

      return {
        success: true,
        ad_plan: createdAdPlan
      };

    } catch (error) {
      console.error('创建广告计划时发生错误:', error);
      return {
        success: false,
        message: '创建广告计划时发生内部错误'
      };
    }
  }

  /**
   * 修改广告计划
   * @param {number} adPlanId - 广告计划ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} - 操作结果
   */
  static async updateAdPlan(adPlanId, updateData) {
    const trx = await knex.transaction();
    
    try {
      // 检查广告计划是否存在
      const existingAdPlan = await trx('ad_plan').where('id', adPlanId).first();
      if (!existingAdPlan) {
        await trx.rollback();
        return {
          success: false,
          message: '广告计划不存在'
        };
      }

      // 如果要修改名称，检查名称是否已被其他广告计划使用
      if (updateData.name && updateData.name !== existingAdPlan.name) {
        const nameExists = await trx('ad_plan')
          .where('name', updateData.name)
          .where('id', '!=', adPlanId)
          .first();
        
        if (nameExists) {
          await trx.rollback();
          return {
            success: false,
            message: '广告计划名称已存在'
          };
        }
      }

      // 更新广告计划信息
      await trx('ad_plan')
        .where('id', adPlanId)
        .update({
          ...updateData,
          updated_at: new Date()
        });

      // 获取更新后的广告计划信息
      const updatedAdPlan = await trx('ad_plan')
        .where('id', adPlanId)
        .first();

      await trx.commit();

      return {
        success: true,
        ad_plan: updatedAdPlan
      };

    } catch (error) {
      await trx.rollback();
      console.error('修改广告计划失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取广告计划
   * @param {number} adPlanId - 广告计划ID
   * @returns {Promise<Object|null>} - 广告计划信息
   */
  static async getAdPlanById(adPlanId) {
    try {
      const adPlan = await knex('ad_plan')
        .where('id', adPlanId)
        .first();
      
      return adPlan;
    } catch (error) {
      console.error('获取广告计划失败:', error);
      throw error;
    }
  }

  /**
   * 获取广告计划列表
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} - 广告计划列表
   */
  static async getAdPlanList(options = {}) {
    try {
      let query = knex('ad_plan');

      // 添加筛选条件
      if (options.status !== undefined) {
        query = query.where('status', options.status);
      }

      if (options.plan_type) {
        query = query.where('plan_type', options.plan_type);
      }

      if (options.target !== undefined) {
        query = query.where('target', options.target);
      }

      // 添加分页
      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.offset(options.offset);
      }

      // 添加排序
      query = query.orderBy('created_at', 'desc');

      const adPlans = await query;
      return adPlans;
    } catch (error) {
      console.error('获取广告计划列表失败:', error);
      throw error;
    }
  }

  /**
   * 绑定广告组到广告计划
   * @param {number} adPlanId - 广告计划ID
   * @param {Array<number>} adGroupIds - 广告组ID数组
   * @returns {Promise<Object>} - 操作结果
   */
  static async bindAdGroups(adPlanId, adGroupIds) {
    const trx = await knex.transaction();
    
    try {
      // 检查广告计划是否存在
      const existingAdPlan = await trx('ad_plan').where('id', adPlanId).first();
      if (!existingAdPlan) {
        await trx.rollback();
        return {
          success: false,
          message: '广告计划不存在'
        };
      }

      // 如果adGroupIds为空、null或undefined，表示不绑定任何广告组
      if (!adGroupIds || adGroupIds.length === 0) {
        // 获取广告计划信息（不包含广告组）
        const updatedAdPlan = await trx('ad_plan').where('id', adPlanId).first();
        
        // 获取绑定的广告组信息
        const boundAdGroups = await trx('ad_plan_ad_group')
          .where('ad_plan_id', adPlanId)
          .join('ad_group', 'ad_plan_ad_group.ad_group_id', '=', 'ad_group.id')
          .select('ad_group.id', 'ad_group.name', 'ad_group.created_at', 'ad_group.updated_at');

        await trx.commit();

        return {
          success: true,
          ad_plan: {
            ...updatedAdPlan,
            ad_groups: boundAdGroups
          },
          message: '操作成功，未绑定任何广告组'
        };
      }

      // 检查广告组是否都存在
      const existingAdGroups = await trx('ad_group').whereIn('id', adGroupIds);
      const existingAdGroupIds = existingAdGroups.map(group => group.id);
      const missingAdGroupIds = adGroupIds.filter(id => !existingAdGroupIds.includes(id));
      
      if (missingAdGroupIds.length > 0) {
        await trx.rollback();
        return {
          success: false,
          message: `广告组不存在: ${missingAdGroupIds.join(', ')}`
        };
      }

      // 检查是否已经绑定过的广告组
      const existingBindings = await trx('ad_plan_ad_group')
        .where('ad_plan_id', adPlanId)
        .whereIn('ad_group_id', adGroupIds);
      
      const alreadyBoundIds = existingBindings.map(binding => binding.ad_group_id);
      const newBindingIds = adGroupIds.filter(id => !alreadyBoundIds.includes(id));

      // 如果有新的绑定关系，则插入
      if (newBindingIds.length > 0) {
        const bindingData = newBindingIds.map(adGroupId => ({
          ad_plan_id: adPlanId,
          ad_group_id: adGroupId,
          created_at: new Date(),
          updated_at: new Date()
        }));

        await trx('ad_plan_ad_group').insert(bindingData);
      }

      // 获取更新后的广告计划信息，包含绑定的广告组
      const updatedAdPlan = await trx('ad_plan').where('id', adPlanId).first();
      
      // 获取绑定的广告组信息
      const boundAdGroups = await trx('ad_plan_ad_group')
        .where('ad_plan_id', adPlanId)
        .join('ad_group', 'ad_plan_ad_group.ad_group_id', '=', 'ad_group.id')
        .select('ad_group.id', 'ad_group.name', 'ad_group.created_at', 'ad_group.updated_at');

      await trx.commit();

      return {
        success: true,
        ad_plan: {
          ...updatedAdPlan,
          ad_groups: boundAdGroups
        },
        message: newBindingIds.length > 0 
          ? `成功绑定 ${newBindingIds.length} 个广告组${alreadyBoundIds.length > 0 ? `，${alreadyBoundIds.length} 个广告组已绑定` : ''}` 
          : '所有广告组已绑定'
      };

    } catch (error) {
      await trx.rollback();
      console.error('绑定广告组失败:', error);
      throw error;
    }
  }

  /**
   * 删除广告计划
   * @param {number} adPlanId - 广告计划ID
   * @returns {Promise<Object>} 删除结果
   */
  static async deleteAdPlan(adPlanId) {
    const trx = await knex.transaction();
    
    try {
      // 检查广告计划是否存在
      const adPlan = await trx('ad_plan').where('id', adPlanId).first();
      if (!adPlan) {
        await trx.rollback();
        return {
          success: false,
          message: '广告计划不存在'
        };
      }

      // 删除相关的广告组绑定关系
      await trx('ad_plan_ad_group').where('ad_plan_id', adPlanId).del();

      // 删除广告计划
      await trx('ad_plan').where('id', adPlanId).del();

      await trx.commit();

      return {
        success: true,
        message: '广告计划删除成功'
      };

    } catch (error) {
      await trx.rollback();
      console.error('删除广告计划失败:', error);
      return {
        success: false,
        message: '删除广告计划失败'
      };
    }
  }

  /**
   * 删除广告组
   * @param {number} adPlanId - 广告计划ID
   * @param {Array} adGroupIds - 广告组ID列表
   * @returns {Promise<Object>} 删除结果
   */
  static async deleteAdGroups(adPlanId, adGroupIds) {
    const trx = await knex.transaction();
    
    try {
      // 检查广告计划是否存在
      const adPlan = await trx('ad_plan').where('id', adPlanId).first();
      if (!adPlan) {
        await trx.rollback();
        return {
          success: false,
          message: '广告计划不存在'
        };
      }

      // 检查所有广告组是否存在
      const existingAdGroups = await trx('ad_group')
        .whereIn('id', adGroupIds)
        .select('id');
      
      const existingAdGroupIds = existingAdGroups.map(group => group.id);
      const nonExistentIds = adGroupIds.filter(id => !existingAdGroupIds.includes(id));
      
      if (nonExistentIds.length > 0) {
        await trx.rollback();
        return {
          success: false,
          message: `广告组不存在: ${nonExistentIds.join(', ')}`
        };
      }

      // 检查广告组中是否还有其他广告计划
      const adGroupsWithOtherPlans = await trx('ad_plan_ad_group')
        .whereIn('ad_group_id', adGroupIds)
        .where('ad_plan_id', '!=', adPlanId)
        .select('ad_group_id');
      
      if (adGroupsWithOtherPlans.length > 0) {
        const conflictIds = adGroupsWithOtherPlans.map(item => item.ad_group_id);
        await trx.rollback();
        return {
          success: false,
          message: `广告组中还有其他广告计划，不能删除: ${conflictIds.join(', ')}`
        };
      }

      // 删除广告计划与广告组的绑定关系
      await trx('ad_plan_ad_group')
        .where('ad_plan_id', adPlanId)
        .whereIn('ad_group_id', adGroupIds)
        .del();

      // 删除广告组
      await trx('ad_group').whereIn('id', adGroupIds).del();

      await trx.commit();

      return {
        success: true,
        message: `成功删除 ${adGroupIds.length} 个广告组`
      };

    } catch (error) {
      await trx.rollback();
      console.error('删除广告组失败:', error);
      return {
        success: false,
        message: '删除广告组失败'
      };
    }
  }
}

module.exports = AdminAdPlanService;