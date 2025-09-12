/**
 * 权限验证工具函数
 */

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
 * 验证超级管理员权限的中间件函数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
function requireSuperAdmin(req, res, next) {
  if (!isSuperAdmin(req.user)) {
    return res.status(403).json({
      code: 403,
      message: '权限不足，只有超级管理员可以执行此操作',
      data: null
    });
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
    return res.status(403).json({
      code: 403,
      message: '权限不足，需要管理员权限',
      data: null
    });
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

module.exports = {
  isSuperAdmin,
  isAdmin,
  requireSuperAdmin,
  requireAdmin,
  hasPermission
};