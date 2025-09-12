const AdminAdCreativeService = require('../../services/admin/adCreativeService');
const { isAdmin } = require('../../utils/permissionUtils');

class AdminAdCreativeController {
  /**
   * 创建广告创意
   */
  static async createAdCreative(req, res) {
    try {
      // 权限验证：只有管理员可以创建广告创意
      if (!isAdmin(req.user)) {
        return res.status(403).json({
          code: 403,
          message: '权限不足，只有管理员可以创建广告创意',
          data: null
        });
      }

      const {
        name, display_id, status, budget, download_cost, click_cost,
        costs, download_count, download_rate, ecpm, display_count,
        click_count, click_rate
      } = req.body;

      // 参数验证
      if (!name || !name.trim()) {
        return res.status(400).json({
          code: 400,
          message: '广告创意名称不能为空',
          data: null
        });
      }

      if (!display_id || !display_id.trim()) {
        return res.status(400).json({
          code: 400,
          message: '展示ID不能为空',
          data: null
        });
      }

      if (status !== 0 && status !== 1) {
        return res.status(400).json({
          code: 400,
          message: '状态值必须为0或1',
          data: null
        });
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
          return res.status(400).json({
            code: 400,
            message: `${label}必须为非负数`,
            data: null
          });
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
        return res.status(201).json({
          code: 201,
          message: '广告创意创建成功',
          data: {
            ad_creative: result.data
          }
        });
      } else {
        return res.status(400).json({
          code: 400,
          message: result.message,
          data: null
        });
      }

    } catch (error) {
      console.error('创建广告创意失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  }

  /**
   * 修改广告创意
   */
  static async updateAdCreative(req, res) {
    try {
      // 权限验证：只有管理员可以修改广告创意
      if (!isAdmin(req.user)) {
        return res.status(403).json({
          code: 403,
          message: '权限不足，只有管理员可以修改广告创意',
          data: null
        });
      }

      const { id } = req.params;
      const {
        name, display_id, status, budget, download_cost, click_cost,
        costs, download_count, download_rate, ecpm, display_count,
        click_count, click_rate
      } = req.body;

      // 参数验证
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          code: 400,
          message: '广告创意ID无效',
          data: null
        });
      }

      if (name !== undefined && (!name || !name.trim())) {
        return res.status(400).json({
          code: 400,
          message: '广告创意名称不能为空',
          data: null
        });
      }

      if (display_id !== undefined && (!display_id || !display_id.trim())) {
        return res.status(400).json({
          code: 400,
          message: '展示ID不能为空',
          data: null
        });
      }

      if (status !== undefined && status !== 0 && status !== 1) {
        return res.status(400).json({
          code: 400,
          message: '状态值必须为0或1',
          data: null
        });
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
          return res.status(400).json({
            code: 400,
            message: `${label}必须为非负数`,
            data: null
          });
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
        return res.status(200).json({
          code: 200,
          message: '广告创意修改成功',
          data: {
            ad_creative: result.data
          }
        });
      } else {
        return res.status(400).json({
          code: 400,
          message: result.message,
          data: null
        });
      }

    } catch (error) {
      console.error('修改广告创意失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  }

  /**
   * 删除广告创意
   */
  static async deleteAdCreative(req, res) {
    try {
      // 权限验证：只有管理员可以删除广告创意
      if (!isAdmin(req.user)) {
        return res.status(403).json({
          code: 403,
          message: '权限不足，只有管理员可以删除广告创意',
          data: null
        });
      }

      const { id } = req.params;

      // 参数验证
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          code: 400,
          message: '广告创意ID无效',
          data: null
        });
      }

      const result = await AdminAdCreativeService.deleteAdCreative(parseInt(id));

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
      console.error('删除广告创意失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  }
}

module.exports = AdminAdCreativeController;