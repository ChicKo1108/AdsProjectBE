const AdminAdCreativeService = require('../../services/admin/adCreativeService');
const { isAdmin } = require('../../utils/permissionUtils');
const ResponseUtils = require('../../utils/responseUtils');

class AdminAdCreativeController {
  /**
   * 创建广告创意
   */
  static async createAdCreative(req, res) {
    try {
      // 权限验证：只有管理员可以创建广告创意
      if (!isAdmin(req.user)) {
        return ResponseUtils.forbidden(res, '权限不足，只有管理员可以创建广告创意');
      }

      const {
        name, display_id, status, budget, download_cost, click_cost,
        costs, download_count, download_rate, ecpm, display_count,
        click_count, click_rate
      } = req.body;

      // 参数验证
      if (!name || !name.trim()) {
        return ResponseUtils.badRequest(res, '广告创意名称不能为空');
      }

      if (!display_id || !display_id.trim()) {
        return ResponseUtils.badRequest(res, '展示ID不能为空');
      }

      if (status !== 0 && status !== 1) {
        return ResponseUtils.badRequest(res, '状态值必须为0或1');
      }

      // 数值类型验证
      const numericFields = {
        budget: '预算',
        download_cost: '下载成本',
        click_cost: '点击成本',
        costs: '消耗金额',
        download_count: '下载量',
        download_rate: '下载率',
        ecpm: 'ECPM',
        display_count: '曝光量',
        click_count: '点击量',
        click_rate: '点击率'
      };

      for (const [field, label] of Object.entries(numericFields)) {
        const value = req.body[field];
        if (value !== undefined && value !== null && (isNaN(value) || value < 0)) {
          return ResponseUtils.badRequest(res, `${label}必须为非负数`);
        }
      }

      const result = await AdminAdCreativeService.createAdCreative({
        name: name.trim(),
        display_id: display_id.trim(),
        status,
        budget,
        download_cost,
        click_cost,
        costs,
        download_count,
        download_rate,
        ecpm,
        display_count,
        click_count,
        click_rate
      });

      if (result.success) {
        return ResponseUtils.created(res, '广告创意创建成功', {
          ad_creative: result.data
        });
      } else {
        return ResponseUtils.badRequest(res, result.message);
      }

    } catch (error) {
      console.error('创建广告创意失败:', error);
      return ResponseUtils.serverError(res, '服务器内部错误');
    }
  }

  /**
   * 修改广告创意
   */
  static async updateAdCreative(req, res) {
    try {
      // 权限验证：只有管理员可以修改广告创意
      if (!isAdmin(req.user)) {
        return ResponseUtils.forbidden(res, '权限不足，只有管理员可以修改广告创意');
      }

      const { id } = req.params;
      const {
        name, display_id, status, budget, download_cost, click_cost,
        costs, download_count, download_rate, ecpm, display_count,
        click_count, click_rate
      } = req.body;

      // 参数验证
      if (!id || isNaN(parseInt(id))) {
        return ResponseUtils.badRequest(res, '广告创意ID无效');
      }

      if (name !== undefined && (!name || !name.trim())) {
        return ResponseUtils.badRequest(res, '广告创意名称不能为空');
      }

      if (display_id !== undefined && (!display_id || !display_id.trim())) {
        return ResponseUtils.badRequest(res, '展示ID不能为空');
      }

      if (status !== undefined && status !== 0 && status !== 1) {
        return ResponseUtils.badRequest(res, '状态值必须为0或1');
      }

      // 数值类型验证
      const numericFields = {
        budget: '预算',
        download_cost: '下载成本',
        click_cost: '点击成本',
        costs: '消耗金额',
        download_count: '下载量',
        download_rate: '下载率',
        ecpm: 'ECPM',
        display_count: '曝光量',
        click_count: '点击量',
        click_rate: '点击率'
      };

      for (const [field, label] of Object.entries(numericFields)) {
        const value = req.body[field];
        if (value !== undefined && value !== null && (isNaN(value) || value < 0)) {
          return ResponseUtils.badRequest(res, `${label}必须为非负数`);
        }
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name.trim();
      if (display_id !== undefined) updateData.display_id = display_id.trim();
      if (status !== undefined) updateData.status = status;
      if (budget !== undefined) updateData.budget = budget;
      if (download_cost !== undefined) updateData.download_cost = download_cost;
      if (click_cost !== undefined) updateData.click_cost = click_cost;
      if (costs !== undefined) updateData.costs = costs;
      if (download_count !== undefined) updateData.download_count = download_count;
      if (download_rate !== undefined) updateData.download_rate = download_rate;
      if (ecpm !== undefined) updateData.ecpm = ecpm;
      if (display_count !== undefined) updateData.display_count = display_count;
      if (click_count !== undefined) updateData.click_count = click_count;
      if (click_rate !== undefined) updateData.click_rate = click_rate;

      const result = await AdminAdCreativeService.updateAdCreative(parseInt(id), updateData);

      if (result.success) {
        return ResponseUtils.success(res, 200, '广告创意修改成功', {
          ad_creative: result.data
        });
      } else {
        return ResponseUtils.badRequest(res, result.message);
      }

    } catch (error) {
      console.error('修改广告创意失败:', error);
      return ResponseUtils.serverError(res, '服务器内部错误');
    }
  }

  /**
   * 删除广告创意
   */
  static async deleteAdCreative(req, res) {
    try {
      // 权限验证：只有管理员可以删除广告创意
      if (!isAdmin(req.user)) {
        return ResponseUtils.forbidden(res, '权限不足，只有管理员可以删除广告创意');
      }

      const { id } = req.params;

      // 参数验证
      if (!id || isNaN(parseInt(id))) {
        return ResponseUtils.badRequest(res, '广告创意ID无效');
      }

      const result = await AdminAdCreativeService.deleteAdCreative(parseInt(id));

      if (result.success) {
        return ResponseUtils.success(res, 200, result.message);
      } else {
        return ResponseUtils.badRequest(res, result.message);
      }

    } catch (error) {
      console.error('删除广告创意失败:', error);
      return ResponseUtils.serverError(res, '服务器内部错误');
    }
  }
}

module.exports = AdminAdCreativeController;