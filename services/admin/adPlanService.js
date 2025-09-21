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
        .where('account_id', adPlanData.account_id)
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
          .where('account_id', existingAdPlan.account_id)
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
   * 批量绑定广告计划到广告组
   * @param {Array} adPlanIds - 广告计划ID数组
   * @param {Array} adGroupIds - 广告组ID数组
   * @returns {Promise<Object>} 绑定结果
   */
  static async batchBindAdPlansToAdGroups(adPlanIds, adGroupIds) {
    const trx = await knex.transaction();
    
    try {
      // 检查广告计划是否都存在
      const existingAdPlans = await trx('ad_plan').whereIn('id', adPlanIds);
      const existingAdPlanIds = existingAdPlans.map(plan => plan.id);
      const missingAdPlanIds = adPlanIds.filter(id => !existingAdPlanIds.includes(id));
      
      if (missingAdPlanIds.length > 0) {
        await trx.rollback();
        return {
          success: false,
          message: `广告计划不存在: ${missingAdPlanIds.join(', ')}`
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

      // 获取已存在的绑定关系
      const existingBindings = await trx('ad_plan_ad_group')
        .whereIn('ad_plan_id', adPlanIds)
        .whereIn('ad_group_id', adGroupIds);
      
      // 创建所有可能的绑定关系
      const allPossibleBindings = [];
      adPlanIds.forEach(planId => {
        adGroupIds.forEach(groupId => {
          allPossibleBindings.push({ ad_plan_id: planId, ad_group_id: groupId });
        });
      });

      // 过滤出需要新建的绑定关系
      const newBindings = allPossibleBindings.filter(binding => {
        return !existingBindings.some(existing => 
          existing.ad_plan_id === binding.ad_plan_id && 
          existing.ad_group_id === binding.ad_group_id
        );
      });

      let boundCount = 0;
      
      // 如果有新的绑定关系，则批量插入
      if (newBindings.length > 0) {
        const bindingData = newBindings.map(binding => ({
          ad_plan_id: binding.ad_plan_id,
          ad_group_id: binding.ad_group_id,
          created_at: new Date(),
          updated_at: new Date()
        }));

        await trx('ad_plan_ad_group').insert(bindingData);
        boundCount = newBindings.length;
      }

      await trx.commit();

      return {
        success: true,
        bound_count: boundCount,
        details: {
          total_possible: allPossibleBindings.length,
          already_bound: existingBindings.length,
          newly_bound: boundCount,
          ad_plan_count: adPlanIds.length,
          ad_group_count: adGroupIds.length
        },
        message: boundCount > 0 
          ? `成功创建 ${boundCount} 个新的绑定关系${existingBindings.length > 0 ? `，${existingBindings.length} 个关系已存在` : ''}` 
          : '所有绑定关系已存在'
      };

    } catch (error) {
      await trx.rollback();
      console.error('批量绑定广告计划到广告组失败:', error);
      throw error;
    }
  }

  /**
   * 解绑广告计划
   * @param {number} adPlanId - 广告计划ID
   * @param {number} adGroupId - 广告组ID
   * @returns {Promise<Object>} 解绑结果
   */
  static async unbindAdPlan(adPlanId, adGroupId) {
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

      // 检查广告组是否存在
      const existingAdGroup = await trx('ad_group').where('id', adGroupId).first();
      if (!existingAdGroup) {
        await trx.rollback();
        return {
          success: false,
          message: '广告组不存在'
        };
      }

      // 检查绑定关系是否存在
      const existingBinding = await trx('ad_plan_ad_group')
        .where({
          ad_plan_id: adPlanId,
          ad_group_id: adGroupId
        })
        .first();

      if (!existingBinding) {
        await trx.rollback();
        return {
          success: false,
          message: '广告计划与广告组之间不存在绑定关系'
        };
      }

      // 删除绑定关系
      await trx('ad_plan_ad_group')
        .where({
          ad_plan_id: adPlanId,
          ad_group_id: adGroupId
        })
        .del();

      await trx.commit();

      return {
        success: true,
        message: `成功解绑广告计划 ${adPlanId} 与广告组 ${adGroupId} 的关系`
      };

    } catch (error) {
      await trx.rollback();
      console.error('解绑广告计划失败:', error);
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

  /**
   * 创建广告组
   * @param {Object} adGroupData - 广告组数据
   * @returns {Promise<Object>} 创建结果
   */
  static async createAdGroup(adGroupData) {
    try {
      // 创建广告组数
      const existingAdGroup = await knex('ad_group')
        .where('name', adGroupData.name)
        .where('account_id', adGroupData.account_id)
        .first();

      if (existingAdGroup) {
        return {
          success: false,
          message: '广告组名称已存在'
        };
      }

      // 准备广告组数据
      const newAdGroupData = {
        ...adGroupData,
        created_at: new Date(),
        updated_at: new Date()
      };

      // 插入广告组到数据库
      const [adGroupId] = await knex('ad_group').insert(newAdGroupData);

      // 获取创建的广告组信息
      const createdAdGroup = await knex('ad_group')
        .where('id', adGroupId)
        .first();

      return {
        success: true,
        ad_group: createdAdGroup
      };

    } catch (error) {
      console.error('创建广告组时发生错误:', error);
      return {
        success: false,
        message: '创建广告组时发生内部错误'
      };
    }
  }

  /**
   * 修改广告组
   * @param {number} adGroupId - 广告组ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} 修改结果
   */
  static async updateAdGroup(adGroupId, updateData) {
    const trx = await knex.transaction();
    
    try {
      // 检查广告组是否存在
      const existingAdGroup = await trx('ad_group').where('id', adGroupId).first();
      if (!existingAdGroup) {
        await trx.rollback();
        return {
          success: false,
          message: '广告组不存在'
        };
      }

      // 检查广告组名称是否已存在
      if (updateData.name && updateData.name !== existingAdGroup.name) {
        const duplicateAdGroup = await trx('ad_group')
          .where('name', updateData.name)
          .where('account_id', existingAdGroup.account_id)
          .where('id', '!=', adGroupId)
          .first();
        
        if (duplicateAdGroup) {
          await trx.rollback();
          return {
            success: false,
            message: '广告组名称已存在'
          };
        }
      }

      // 更新广告组数据
      const finalUpdateData = {
        ...updateData,
        updated_at: new Date()
      };

      await trx('ad_group')
        .where('id', adGroupId)
        .update(finalUpdateData);

      // 获取更新后的广告组信息
      const updatedAdGroup = await trx('ad_group')
        .where('id', adGroupId)
        .first();

      await trx.commit();

      return {
        success: true,
        ad_group: updatedAdGroup
      };

    } catch (error) {
      await trx.rollback();
      console.error('修改广告组时发生错误:', error);
      return {
        success: false,
        message: '修改广告组时发生内部错误'
      };
    }
  }

  /**
   * 删除广告组
   * @param {number} adGroupId - 广告组ID
   * @returns {Promise<Object>} 删除结果
   */
  static async deleteAdGroup(adGroupId) {
    const trx = await knex.transaction();
    
    try {
      // 检查广告组是否存在
      const existingAdGroup = await trx('ad_group').where('id', adGroupId).first();
      if (!existingAdGroup) {
        await trx.rollback();
        return {
          success: false,
          message: '广告组不存在'
        };
      }

      // 检查是否有广告计划绑定到此广告组
      const boundAdPlans = await trx('ad_plan_ad_group')
        .where('ad_group_id', adGroupId)
        .count('* as count')
        .first();

      if (boundAdPlans.count > 0) {
        await trx.rollback();
        return {
          success: false,
          message: `无法删除广告组，还有 ${boundAdPlans.count} 个广告计划绑定到此广告组`
        };
      }

      // 删除广告组
      await trx('ad_group').where('id', adGroupId).del();

      await trx.commit();

      return {
        success: true,
        message: `广告组 "${existingAdGroup.name}" 删除成功`
      };

    } catch (error) {
      await trx.rollback();
      console.error('删除广告组时发生错误:', error);
      return {
        success: false,
        message: '删除广告组时发生内部错误'
      };
    }
  }
}

module.exports = AdminAdPlanService;