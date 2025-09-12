const AdminAdPlanService = require('../../services/admin/adPlanService');
const { isAdmin } = require('../../utils/permissionUtils');
const { AD_PLAN_ENUMS, getEnumValues, isValidEnumValue } = require('../../utils/constants');

class AdminAdPlanController {
  /**
   * 新建广告计划
   */
  static async createAdPlan(req, res) {
    try {
      // 权限验证：只有超级管理员可以创建广告计划
      if (!isAdmin(req.user)) {
        return res.status(403).json({
          code: 403,
          message: '权限不足，只有管理员可以创建广告计划',
          data: null
        });
      }

      const {
        name, plan_type, target, price_stratagy, placement_type, status,
        chuang_yi_you_xuan, budget, cost, display_count, click_count,
        download_count, click_per_price, click_rate, ecpm, download_per_count,
        download_rate, start_date, end_date
      } = req.body;

      // 参数验证
      if (!name || !name.trim()) {
        return res.status(400).json({
          code: 400,
          message: '广告计划名称不能为空',
          data: null
        });
      }

      if (!plan_type || !plan_type.trim()) {
        return res.status(400).json({
          code: 400,
          message: '计划类型不能为空',
          data: null
        });
      }

      if (!target || !target.trim()) {
        return res.status(400).json({
          code: 400,
          message: '目标不能为空',
          data: null
        });
      }

      // 验证target枚举值
      if (!isValidEnumValue(AD_PLAN_ENUMS.TARGET, target)) {
        return res.status(400).json({
          code: 400,
          message: '目标值无效，必须是: ' + getEnumValues(AD_PLAN_ENUMS.TARGET).join(', '),
          data: null
        });
      }

      if (!price_stratagy || !price_stratagy.trim()) {
        return res.status(400).json({
          code: 400,
          message: '价格策略不能为空',
          data: null
        });
      }

      // 验证price_stratagy枚举值
      if (!isValidEnumValue(AD_PLAN_ENUMS.PRICE_STRATEGY, price_stratagy)) {
        return res.status(400).json({
          code: 400,
          message: '价格策略无效，必须是: ' + getEnumValues(AD_PLAN_ENUMS.PRICE_STRATEGY).join(', '),
          data: null
        });
      }

      if (!placement_type || !placement_type.trim()) {
        return res.status(400).json({
          code: 400,
          message: '投放类型不能为空',
          data: null
        });
      }

      // 调用服务层创建广告计划
      const result = await AdminAdPlanService.createAdPlan({
        name: name.trim(),
        plan_type: plan_type.trim(),
        target,
        price_stratagy,
        placement_type: placement_type.trim(),
        status: status || 0,
        chuang_yi_you_xuan: chuang_yi_you_xuan || 0,
        budget: budget || 0,
        cost: cost || 0,
        display_count: display_count || 0,
        click_count: click_count || 0,
        download_count: download_count || 0,
        click_per_price: click_per_price || 0,
        click_rate: click_rate || 0,
        ecpm: ecpm || 0,
        download_per_count: download_per_count || 0,
        download_rate: download_rate || 0,
        start_date,
        end_date
      });

      if (!result.success) {
        return res.status(400).json({
          code: 400,
          message: result.message,
          data: null
        });
      }

      res.status(201).json({
        code: 201,
        message: '广告计划创建成功',
        data: {
          ad_plan: result.ad_plan
        }
      });

    } catch (error) {
      console.error('创建广告计划失败:', error);
      res.status(500).json({
        code: 500,
        message: '创建广告计划失败',
        data: null
      });
    }
  }

  /**
   * 修改广告计划
   */
  static async updateAdPlan(req, res) {
    try {
      // 权限验证：只有超级管理员可以修改广告计划
      if (!isAdmin(req.user)) {
        return res.status(403).json({
          code: 403,
          message: '权限不足，只有管理员可以修改广告计划',
          data: null
        });
      }

      const { id } = req.params;
      const {
        name, plan_type, target, price_stratagy, placement_type, status,
        chuang_yi_you_xuan, budget, cost, display_count, click_count,
        download_count, click_per_price, click_rate, ecpm, download_per_count,
        download_rate, start_date, end_date
      } = req.body;

      // 参数验证
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          code: 400,
          message: '广告计划ID无效',
          data: null
        });
      }

      // 至少需要一个参数
      const hasUpdateFields = name !== undefined || plan_type !== undefined ||
        target !== undefined || price_stratagy !== undefined ||
        placement_type !== undefined || status !== undefined ||
        chuang_yi_you_xuan !== undefined || budget !== undefined ||
        cost !== undefined || display_count !== undefined ||
        click_count !== undefined || download_count !== undefined ||
        click_per_price !== undefined || click_rate !== undefined ||
        ecpm !== undefined || download_per_count !== undefined ||
        download_rate !== undefined || start_date !== undefined ||
        end_date !== undefined;

      if (!hasUpdateFields) {
        return res.status(400).json({
          code: 400,
          message: '至少需要提供一个要修改的字段',
          data: null
        });
      }

      // 验证必填字段
      if (name !== undefined && (!name || !name.trim())) {
        return res.status(400).json({
          code: 400,
          message: '广告计划名称不能为空',
          data: null
        });
      }

      if (plan_type !== undefined && (!plan_type || !plan_type.trim())) {
        return res.status(400).json({
          code: 400,
          message: '计划类型不能为空',
          data: null
        });
      }

      if (placement_type !== undefined && (!placement_type || !placement_type.trim())) {
        return res.status(400).json({
          code: 400,
          message: '投放类型不能为空',
          data: null
        });
      }

      // 验证target枚举值
      if (target !== undefined) {
        if (!target || !target.trim()) {
          return res.status(400).json({
            code: 400,
            message: '目标不能为空',
            data: null
          });
        }
        if (!isValidEnumValue(AD_PLAN_ENUMS.TARGET, target)) {
           return res.status(400).json({
             code: 400,
             message: '目标值无效，必须是: ' + getEnumValues(AD_PLAN_ENUMS.TARGET).join(', '),
             data: null
           });
         }
      }

      // 验证price_stratagy枚举值
      if (price_stratagy !== undefined) {
        if (!price_stratagy || !price_stratagy.trim()) {
          return res.status(400).json({
            code: 400,
            message: '价格策略不能为空',
            data: null
          });
        }
        if (!isValidEnumValue(AD_PLAN_ENUMS.PRICE_STRATEGY, price_stratagy)) {
           return res.status(400).json({
             code: 400,
             message: '价格策略无效，必须是: ' + getEnumValues(AD_PLAN_ENUMS.PRICE_STRATEGY).join(', '),
             data: null
           });
         }
      }

      // 构建更新数据
      const updateData = {};
      if (name !== undefined) updateData.name = name.trim();
      if (plan_type !== undefined) updateData.plan_type = plan_type.trim();
      if (target !== undefined) updateData.target = target;
      if (price_stratagy !== undefined) updateData.price_stratagy = price_stratagy;
      if (placement_type !== undefined) updateData.placement_type = placement_type.trim();
      if (status !== undefined) updateData.status = status;
      if (chuang_yi_you_xuan !== undefined) updateData.chuang_yi_you_xuan = chuang_yi_you_xuan;
      if (budget !== undefined) updateData.budget = budget;
      if (cost !== undefined) updateData.cost = cost;
      if (display_count !== undefined) updateData.display_count = display_count;
      if (click_count !== undefined) updateData.click_count = click_count;
      if (download_count !== undefined) updateData.download_count = download_count;
      if (click_per_price !== undefined) updateData.click_per_price = click_per_price;
      if (click_rate !== undefined) updateData.click_rate = click_rate;
      if (ecpm !== undefined) updateData.ecpm = ecpm;
      if (download_per_count !== undefined) updateData.download_per_count = download_per_count;
      if (download_rate !== undefined) updateData.download_rate = download_rate;
      if (start_date !== undefined) updateData.start_date = start_date;
      if (end_date !== undefined) updateData.end_date = end_date;

      // 调用服务层修改广告计划
      const result = await AdminAdPlanService.updateAdPlan(parseInt(id), updateData);

      if (!result.success) {
        return res.status(400).json({
          code: 400,
          message: result.message,
          data: null
        });
      }

      res.status(200).json({
        code: 200,
        message: '广告计划修改成功',
        data: {
          ad_plan: result.ad_plan
        }
      });

    } catch (error) {
      console.error('修改广告计划失败:', error);
      res.status(500).json({
        code: 500,
        message: '修改广告计划失败',
        data: null
      });
    }
  }

  /**
   * 绑定广告组
   */
  static async bindAdGroups(req, res) {
    try {
      // 权限验证：管理员可以绑定广告组
      if (!isAdmin(req.user)) {
        return res.status(403).json({
          code: 403,
          message: '权限不足，需要管理员权限',
          data: null
        });
      }

      const { id } = req.params;
      const { ad_group_ids } = req.body;

      // 参数验证
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          code: 400,
          message: '广告计划ID无效',
          data: null
        });
      }

      // 如果ad_group_ids为空或null，表示不绑定任何广告组
      if (ad_group_ids !== null && ad_group_ids !== undefined) {
        if (!Array.isArray(ad_group_ids)) {
          return res.status(400).json({
            code: 400,
            message: '广告组ID列表必须为数组格式',
            data: null
          });
        }

        // 验证广告组ID格式（如果数组不为空）
        if (ad_group_ids.length > 0) {
          const invalidIds = ad_group_ids.filter(adGroupId => !Number.isInteger(adGroupId) || adGroupId <= 0);
          if (invalidIds.length > 0) {
            return res.status(400).json({
              code: 400,
              message: '广告组ID必须是有效的正整数',
              data: null
            });
          }
        }
      }

      // 调用服务层绑定广告组
      const result = await AdminAdPlanService.bindAdGroups(parseInt(id), ad_group_ids);

      if (!result.success) {
        return res.status(400).json({
          code: 400,
          message: result.message,
          data: null
        });
      }

      res.status(200).json({
        code: 200,
        message: '广告组绑定成功',
        data: {
          ad_plan: result.ad_plan
        }
      });

    } catch (error) {
      console.error('绑定广告组失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  }

  /**
   * 删除广告计划
   */
  static async deleteAdPlan(req, res) {
    try {
      // 权限验证：只有管理员可以删除广告计划
      if (!isAdmin(req.user)) {
        return res.status(403).json({
          code: 403,
          message: '权限不足，只有管理员可以删除广告计划',
          data: null
        });
      }

      const { id } = req.params;

      // 参数验证
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          code: 400,
          message: '广告计划ID无效',
          data: null
        });
      }

      const result = await AdminAdPlanService.deleteAdPlan(parseInt(id));

      if (result.success) {
        return res.status(200).json({
          code: 200,
          message: result.message,
          data: null
        });
      } else {
        return res.status(400).json({
          code: 400,
          message: result.message,
          data: null
        });
      }

    } catch (error) {
      console.error('删除广告计划失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  }

  /**
   * 删除广告组
   */
  static async deleteAdGroups(req, res) {
    try {
      // 权限验证：只有管理员可以删除广告组
      if (!isAdmin(req.user)) {
        return res.status(403).json({
          code: 403,
          message: '权限不足，只有管理员可以删除广告组',
          data: null
        });
      }

      const { id } = req.params;
      const { ad_group_ids } = req.body;

      // 参数验证
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          code: 400,
          message: '广告计划ID无效',
          data: null
        });
      }

      // 验证广告组ID格式
      const invalidIds = ad_group_ids.filter(adGroupId => !Number.isInteger(adGroupId) || adGroupId <= 0);
      if (invalidIds.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '广告组ID必须为有效的正整数',
          data: null
        });
      }

      const result = await AdminAdPlanService.deleteAdGroups(parseInt(id), ad_group_ids);

      if (result.success) {
        return res.status(200).json({
          code: 200,
          message: result.message,
          data: null
        });
      } else {
        return res.status(400).json({
          code: 400,
          message: result.message,
          data: null
        });
      }

    } catch (error) {
      console.error('删除广告组失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  }
}

module.exports = AdminAdPlanController;