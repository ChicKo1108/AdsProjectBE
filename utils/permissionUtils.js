/**
 * 权限工具函数
 * 用于处理用户权限验证相关的功能
 */
const ResponseUtils = require('./responseUtils');

/**
 * 检查用户是否为超级管理员
 * @param {Object} user - 用户信息对象
 * @returns {boolean} - 是否为超级管理员
 */
function isSuperAdmin(user) {
  return user && user.role === 'super-admin';
}

/**
 * 检查用户是否为管理员（包括超级管理员和普通管理员）
 * @param {Object} user - 用户信息对象
 * @returns {boolean} - 是否为管理员
 */
function isAdmin(user) {
  return user && (user.role === 'super-admin' || user.role === 'admin');
}

/**
 * 检查用户是否有账户权限
 * @param {Object} user - 用户信息对象
 * @returns {boolean} - 是否有账户权限
 */
function hasAccountPermission(user) {
  return user && (user.role === 'super-admin' || user.role === 'site_admin' || user.role === 'ad_operator');
}

/**
 * 验证超级管理员权限的中间件函数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
function requireSuperAdmin(req, res, next) {
  if (!isSuperAdmin(req.user)) {
    return ResponseUtils.forbidden(res, '权限不足，只有超级管理员可以执行此操作');
  }
  next();
}

/**
 * 验证管理员权限的中间件函数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
function requireAdmin(req, res, next) {
  if (!isAdmin(req.user)) {
    return ResponseUtils.forbidden(res, '权限不足，需要管理员权限');
  }
  next();
}

/**
 * 检查用户权限的通用函数
 * @param {Object} user - 用户信息对象
 * @param {string|Array} requiredRoles - 需要的角色（字符串或数组）
 * @returns {boolean} - 是否有权限
 */
function hasPermission(user, requiredRoles) {
  if (!user || !user.role) {
    return false;
  }
  
  if (typeof requiredRoles === 'string') {
    return user.role === requiredRoles;
  }
  
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(user.role);
  }
  
  return false;
}

/**
 * 检查用户是否有权限编辑指定字段
 * @param {Object} user - 用户对象
 * @param {Array} fields - 要编辑的字段数组
 * @returns {Object} - 返回权限检查结果
 */
function checkFieldPermissions(user, fields) {
  // 只有site_admin可以编辑的字段
  const siteAdminOnlyFields = [
    'cost',
    'display_count', 
    'click_count',
    'download_count',
    'click_per_price',
    'click_rate',
    'ecpm',
    'download_per_count',
    'download_rate'
  ];

  // ad_operator可以编辑的字段
  const adOperatorFields = [
    'name',
    'plan_type',
    'target',
    'price_stratagy',
    'placement_type',
    'status',
    'chuang_yi_you_xuan',
    'budget',
    'start_date',
    'end_date'
  ];

  const restrictedFields = [];
  const allowedFields = [];

  for (const field of fields) {
    if (siteAdminOnlyFields.includes(field)) {
      // 只有site_admin可以编辑这些字段
      if (user.role === 'site_admin') {
        allowedFields.push(field);
      } else {
        restrictedFields.push(field);
      }
    } else if (adOperatorFields.includes(field)) {
      // ad_operator和site_admin都可以编辑这些字段
      if (user.role === 'site_admin' || user.role === 'ad_operator') {
        allowedFields.push(field);
      } else {
        restrictedFields.push(field);
      }
    } else {
      // 未知字段，默认拒绝
      restrictedFields.push(field);
    }
  }

  return {
    hasPermission: restrictedFields.length === 0,
    restrictedFields,
    allowedFields
  };
}

/**
 * 检查 AdCreatives 字段权限
 * @param {Object} user - 用户对象
 * @param {Array} requestedFields - 请求的字段列表
 * @returns {Object} - 权限检查结果
 */
function checkAdCreativesFieldPermissions(user, requestedFields) {
  // ad_operator 只能操作基本字段
  const adOperatorFields = [
    'name',
    'display_id', 
    'status',
    'budget'
  ];

  // site_admin 可以操作所有字段（包括统计字段）
  const siteAdminOnlyFields = [
    'download_cost',
    'click_cost',
    'costs',
    'download_count',
    'download_rate',
    'ecpm',
    'display_count',
    'click_count',
    'click_rate'
  ];

  // 如果是 site_admin，可以操作所有字段
  if (user.role === 'site_admin') {
    return {
      hasPermission: true,
      restrictedFields: []
    };
  }

  // 如果是 ad_operator，只能操作基本字段
  if (user.role === 'ad_operator') {
    const restrictedFields = requestedFields.filter(field => 
      !adOperatorFields.includes(field)
    );
    
    return {
      hasPermission: restrictedFields.length === 0,
      restrictedFields
    };
  }

  // 其他角色没有权限
  return {
    hasPermission: false,
    restrictedFields: requestedFields
  };
}

module.exports = {
  isSuperAdmin,
  isAdmin,
  hasAccountPermission,
  requireSuperAdmin,
  requireAdmin,
  hasPermission,
  checkFieldPermissions,
  checkAdCreativesFieldPermissions
};