/**
 * 权限工具函数
 * 用于处理用户权限验证相关的功能
 */
const ResponseUtils = require("./responseUtils");

/**
 * 检查用户是否为超级管理员
 * @param {Object} user - 用户信息对象
 * @returns {boolean} - 是否为超级管理员
 */
function isSuperAdmin(user) {
  return user && user.role === "super-admin";
}

/**
 * 检查用户是否有账户权限
 * @param {Object} user - 用户信息对象
 * @returns {boolean} - 是否有账户权限
 */
function hasAccountPermission(req) {
  const user = req.user;
  const accountId = req.params.accountId || req.query.accountId;
  if (!accountId) {
    return false;
  }
  let role = user.role;
  if (role === "super-admin") {
    return true;
  }
  if (
    user.accountPermissions.some(
      (p) => p.accountId === Number(accountId) && p.accountRole === "site_admin"
    )
  ) {
    return true;
  }
  return false;
}

/**
 * 验证超级管理员权限的中间件函数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
function requireSuperAdmin(req, res, next) {
  if (!isSuperAdmin(req.user)) {
    return ResponseUtils.forbidden(
      res,
      "权限不足，只有超级管理员可以执行此操作"
    );
  }
  next();
}

/**
 * 检查广告计划是否有权限编辑指定字段
 * @param {Object} user - 用户对象
 * @param {Array} fields - 要编辑的字段数组
 * @param {number} accountId - 账户ID（可选，用于账户级别权限检查）
 * @returns {Promise<Object>} - 返回权限检查结果
 */
async function checkAdPlanFieldPermissions(
  user,
  requestedFields,
  accountId = null
) {
  // ad_operator 只能操作基本字段
  const adOperatorFields = [
    "chuang_yi_you_xuan",
    "budget",
    "name",
    "placement_type",
    "plan_type",
    "price_stratagy",
    "status",
    "target",
    "accountId",
  ];
  const userAccountPermisson =
    user.accountPermissions.find((p) => p.accountId === accountId) || {};
  if (!userAccountPermisson.accountRole) {
    return {
      hasPermission: false,
      restrictedFields: requestedFields,
    };
  }

  // 如果是 site_admin，可以操作所有字段
  if (userAccountPermisson.accountRole === "site_admin") {
    return {
      hasPermission: true,
      restrictedFields: [],
    };
  }

  // 如果是 ad_operator，只能操作基本字段
  if (userAccountPermisson.accountRole === "ad_operator") {
    const restrictedFields = requestedFields.filter(
      (field) => !adOperatorFields.includes(field)
    );

    return {
      hasPermission: restrictedFields.length === 0,
      restrictedFields,
    };
  }

  // 其他角色没有权限
  return {
    hasPermission: false,
    restrictedFields: requestedFields,
  };
}

/**
 * 检查广告创意字段权限
 * @param {Object} user - 用户对象
 * @param {Array} requestedFields - 请求的字段列表
 * @param {number} accountId - 账户ID（可选）
 * @returns {Object} - 权限检查结果
 */
async function checkAdCreativesFieldPermissions(
  user,
  requestedFields,
  accountId = null
) {
  // ad_operator 只能操作基本字段
  const adOperatorFields = [
    "name",
    "display_id",
    "status",
    "budget",
    "click_cost",
    "download_cost",
    "accountId",
  ];

  const userAccountPermisson =
    user.accountPermissions.find((p) => p.accountId === accountId) || {};
    
  if (!userAccountPermisson.accountRole) {
    return {
      hasPermission: false,
      restrictedFields: requestedFields,
    };
  }
  // 如果是 site_admin，可以操作所有字段
  if (userAccountPermisson.accountRole === "site_admin") {
    return {
      hasPermission: true,
      restrictedFields: [],
    };
  }

  // 如果是 ad_operator，只能操作基本字段
  if (userAccountPermisson.accountRole === "ad_operator") {
    const restrictedFields = requestedFields.filter(
      (field) => !adOperatorFields.includes(field)
    );

    return {
      hasPermission: restrictedFields.length === 0,
      restrictedFields,
    };
  }

  // 其他角色没有权限
  return {
    hasPermission: false,
    restrictedFields: requestedFields,
  };
}

module.exports = {
  isSuperAdmin,
  hasAccountPermission,
  requireSuperAdmin,
  checkAdPlanFieldPermissions,
  checkAdCreativesFieldPermissions,
};