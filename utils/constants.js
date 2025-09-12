/**
 * 系统常量定义
 */

// 广告计划相关枚举
const AD_PLAN_ENUMS = {
  // 推广目标
  TARGET: {
    MOBILE_APP: 'mobile_app',
    GAME: 'game',
    ECOMMERCE: 'ecommerce',
    EDUCATION: 'education',
    FINANCE: 'finance'
  },
  
  // 竞价策略
  PRICE_STRATEGY: {
    AUTO_BID: 'auto_bid',
    MANUAL_BID: 'manual_bid'
  },
  
  // 计划状态
  STATUS: {
    DRAFT: 0,      // 草稿
    ACTIVE: 1,     // 启用
    PAUSED: 2,     // 暂停
    ENDED: 3       // 结束
  },
  
  // 投放类型
  PLACEMENT_TYPE: {
    FEED: 'feed',              // 信息流
    BANNER: 'banner',          // 横幅
    INTERSTITIAL: 'interstitial', // 插屏
    SPLASH: 'splash',          // 开屏
    VIDEO: 'video'             // 视频
  }
};

// 用户角色枚举
const USER_ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  USER: 'user'
};

// 广告创意状态
const AD_CREATIVE_STATUS = {
  INACTIVE: 0,   // 暂停
  ACTIVE: 1      // 活跃
};

// 获取枚举值数组的辅助函数
const getEnumValues = (enumObj) => {
  return Object.values(enumObj);
};

// 获取枚举键值对的辅助函数
const getEnumOptions = (enumObj) => {
  return Object.entries(enumObj).map(([key, value]) => ({ key, value }));
};

// 验证枚举值的辅助函数
const isValidEnumValue = (enumObj, value) => {
  return Object.values(enumObj).includes(value);
};

module.exports = {
  AD_PLAN_ENUMS,
  USER_ROLES,
  AD_CREATIVE_STATUS,
  getEnumValues,
  getEnumOptions,
  isValidEnumValue
};