const logger = require('../logger');

/**
 * 权限验证中间件
 * 支持多层级权限验证：super-admin、site_admin、ad_operator
 */

/**
 * 检查是否为超级管理员
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    logger.warn('权限验证失败：用户信息不存在');
    return res.status(401).json({ 
      code: -1, 
      success: false, 
      message: '用户信息不存在', 
      data: {} 
    });
  }

  if (req.user.role !== 'super-admin') {
    logger.warn(`权限验证失败：用户 ${req.user.username} 不是超级管理员`);
    return res.status(403).json({ 
      code: 403, 
      success: false, 
      message: '权限不足，只有超级管理员可以执行此操作', 
      data: {} 
    });
  }

  logger.info(`超级管理员权限验证通过：${req.user.username}`);
  next();
};


/**
 * 检查账户权限
 * @param {string} requiredRole - 所需的最低权限级别 ('site_admin' 或 'ad_operator')
 * @param {string} accountIdParam - 账户ID参数名（从req.params中获取）
 */
const requireAccountPermission = (requiredRole = 'ad_operator', accountIdParam = 'accountId') => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn('权限验证失败：用户信息不存在');
      return res.status(401).json({ 
        code: -1, 
        success: false, 
        message: '用户信息不存在', 
        data: {} 
      });
    }

    // 获取请求的账户ID
    const accountId = req.params[accountIdParam] || req.body.accountId || req.query.accountId;
    if (!accountId) {
      logger.warn('权限验证失败：未提供账户ID');
      return res.status(400).json({ 
        code: 400, 
        success: false, 
        message: '缺少账户ID参数', 
        data: {} 
      });
    }

    // 检查用户在该账户中的权限
    const accountPermissions = req.user.accountPermissions || [];
    const userAccountPermission = accountPermissions.find(
      perm => perm.accountId.toString() === accountId.toString()
    );

    if (!userAccountPermission) {
      logger.warn(`权限验证失败：用户 ${req.user.username} 无权访问账户 ${accountId}`);
      return res.status(403).json({ 
        code: 403, 
        success: false, 
        message: '权限不足，您无权访问此账户', 
        data: {} 
      });
    }

    // 检查权限级别
    const roleHierarchy = {
      'site_admin': 2,
      'ad_operator': 1
    };

    const userRoleLevel = roleHierarchy[userAccountPermission.accountRole] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      logger.warn(`权限验证失败：用户 ${req.user.username} 在账户 ${accountId} 中的权限级别不足`);
      return res.status(403).json({ 
        code: 403, 
        success: false, 
        message: `权限不足，请联系管理员`, 
        data: {} 
      });
    }

    // 将账户权限信息添加到请求对象中
    req.accountPermission = userAccountPermission;
    
    logger.info(`账户权限验证通过：用户 ${req.user.username} 在账户 ${accountId} 中拥有 ${userAccountPermission.accountRole} 权限`);
    next();
  };
};



/**
 * 组合权限验证：超级管理员或账户权限
 * @param {string} requiredRole - 账户中所需的最低权限级别
 * @param {string} accountIdParam - 账户ID参数名
 */
const requireSuperAdminOrAccountPermission = (requiredRole = 'ad_operator', accountIdParam = 'accountId') => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn('权限验证失败：用户信息不存在');
      return res.status(401).json({ 
        code: -1, 
        success: false, 
        message: '用户信息不存在', 
        data: {} 
      });
    }

    // 超级管理员直接通过
    if (req.user.role === 'super-admin') {
      logger.info(`超级管理员权限验证通过：${req.user.username}`);
      return next();
    }

    // 否则检查账户权限
    return requireAccountPermission(requiredRole, accountIdParam)(req, res, next);
  };
};

module.exports = {
  requireSuperAdmin,
  requireAccountPermission,
  requireSuperAdminOrAccountPermission
};