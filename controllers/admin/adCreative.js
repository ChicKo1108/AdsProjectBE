const AdminAdCreativeService = require('../../services/admin/adCreativeService');
const { isAdmin, checkAdCreativesFieldPermissions } = require('../../utils/permissionUtils');
const ResponseUtils = require('../../utils/responseUtils');

class AdminAdCreativeController {
  /**
   * 创建广告创意
   */
  static async createAdCreative(req, res) {
    try {
      // 权限验证：需要ad_operator或site_admin权限
      if (!req.user || (req.user.role !== 'ad_operator' && req.user.role !== 'site_admin')) {
        return ResponseUtils.forbidden(res, '权限不足，需要广告操作员或站点管理员权限');
      }

      const {
        name, display_id, status, budget, download_cost, click_cost,
        costs, download_count, download_rate, ecpm, display_count,
        click_count, click_rate, accountId
      } = req.body;

      // 检查字段级权限
      const requestedFields = Object.keys(req.body);
      const permissionCheck = checkAdCreativesFieldPermissions(req.user, requestedFields);
      
      if (!permissionCheck.hasPermission) {
        return ResponseUtils.forbidden(res, 
          `权限不足，无法设置以下字段: ${permissionCheck.restrictedFields.join(', ')}`
        );
      }

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

      // 验证accountId参数
      if (accountId && isNaN(parseInt(accountId))) {
        return ResponseUtils.badRequest(res, '账户ID必须是数字');
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

      // 构建创建数据，只包含用户有权限设置的字段
      const createData = {
        name: name.trim(),
        display_id: display_id.trim(),
        status,
        budget
      };

      // 添加accountId到创建数据
      if (accountId) {
        createData.account_id = parseInt(accountId);
      }

      // 只有site_admin可以设置统计字段
      if (req.user.role === 'site_admin') {
        if (download_cost !== undefined) createData.download_cost = download_cost;
        if (click_cost !== undefined) createData.click_cost = click_cost;
        if (costs !== undefined) createData.costs = costs;
        if (download_count !== undefined) createData.download_count = download_count;
        if (download_rate !== undefined) createData.download_rate = download_rate;
        if (ecpm !== undefined) createData.ecpm = ecpm;
        if (display_count !== undefined) createData.display_count = display_count;
        if (click_count !== undefined) createData.click_count = click_count;
        if (click_rate !== undefined) createData.click_rate = click_rate;
      }

      const result = await AdminAdCreativeService.createAdCreative(createData);

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
      // 权限验证：需要ad_operator或site_admin权限
      if (!req.user || (req.user.role !== 'ad_operator' && req.user.role !== 'site_admin')) {
        return ResponseUtils.forbidden(res, '权限不足，需要广告操作员或站点管理员权限');
      }

      const { id } = req.params;
      const {
        name, display_id, status, budget, download_cost, click_cost,
        costs, download_count, download_rate, ecpm, display_count,
        click_count, click_rate, accountId
      } = req.body;

      // 参数验证
      if (!id || isNaN(parseInt(id))) {
        return ResponseUtils.badRequest(res, '广告创意ID无效');
      }

      // 验证accountId参数
      if (accountId && isNaN(parseInt(accountId))) {
        return ResponseUtils.badRequest(res, '账户ID必须是数字');
      }

      // 检查字段级权限
      const requestedFields = Object.keys(req.body);
      const permissionCheck = checkAdCreativesFieldPermissions(req.user, requestedFields);
      
      if (!permissionCheck.hasPermission) {
        return ResponseUtils.forbidden(res, 
          `权限不足，无法修改以下字段: ${permissionCheck.restrictedFields.join(', ')}`
        );
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

      // 构建更新数据，只包含用户有权限修改的字段
      const updateData = {};
      
      // ad_operator和site_admin都可以修改的字段
      if (name !== undefined) updateData.name = name.trim();
      if (display_id !== undefined) updateData.display_id = display_id.trim();
      if (status !== undefined) updateData.status = status;
      if (budget !== undefined) updateData.budget = budget;

      // 添加accountId到更新数据
      if (accountId) {
        updateData.account_id = parseInt(accountId);
      }

      // 只有site_admin可以修改的统计字段
      if (req.user.role === 'site_admin') {
        if (download_cost !== undefined) updateData.download_cost = download_cost;
        if (click_cost !== undefined) updateData.click_cost = click_cost;
        if (costs !== undefined) updateData.costs = costs;
        if (download_count !== undefined) updateData.download_count = download_count;
        if (download_rate !== undefined) updateData.download_rate = download_rate;
        if (ecpm !== undefined) updateData.ecpm = ecpm;
        if (display_count !== undefined) updateData.display_count = display_count;
        if (click_count !== undefined) updateData.click_count = click_count;
        if (click_rate !== undefined) updateData.click_rate = click_rate;
      }

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
      const { accountId } = req.query;

      // 参数验证
      if (!id || isNaN(parseInt(id))) {
        return ResponseUtils.badRequest(res, '广告创意ID无效');
      }

      // 验证accountId参数
      if (accountId && isNaN(parseInt(accountId))) {
        return ResponseUtils.badRequest(res, '账户ID必须是数字');
      }

      const result = await AdminAdCreativeService.deleteAdCreative(parseInt(id), accountId ? parseInt(accountId) : null);

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