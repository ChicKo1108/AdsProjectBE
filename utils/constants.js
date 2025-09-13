/**
 * 常量定义文件
 * 用于定义项目中使用的常量
 */

// 广告计划相关常量
const AD_PLAN = {
  // 推广目标（更新后的枚举值）
  TARGET: {
    APP: 'app',                // 应用推广
    WEB: 'web',                // 网页推广
    QUICK_APP: 'quick_app',    // 快应用推广
    MINI_APP: 'mini_app',      // 小程序推广
    DOWNLOAD: 'download'       // 应用下载
  },

  // 竞价策略（更新后的枚举值）
  PRICE_STRATEGY: {
    STABLE_COST: 'stable_cost',        // 稳定成本
    MAX_CONVERSION: 'max_conversion',  // 最大转化
    OPTIMAL_COST: 'optimal_cost'       // 最优成本
  },

  // 状态
  STATUS: {
    DRAFT: 0,     // 草稿
    ACTIVE: 1,    // 启用
    PAUSED: 2,    // 暂停
    ENDED: 3      // 结束
  },

  // 创意优选
  CREATIVE_OPTIMIZATION: {
    DISABLED: 0,  // 未启动
    ENABLED: 1    // 启动
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

// 获取枚举值的中文描述
const getEnumDescription = (enumType, value) => {
  const descriptions = {
    TARGET: {
      'app': '应用推广',
      'web': '网页推广',
      'quick_app': '快应用推广',
      'mini_app': '小程序推广',
      'download': '应用下载'
    },
    PRICE_STRATEGY: {
      'stable_cost': '稳定成本',
      'max_conversion': '最大转化',
      'optimal_cost': '最优成本'
    },
    STATUS: {
      0: '草稿',
      1: '启用',
      2: '暂停',
      3: '结束'
    }
  };
  
  return descriptions[enumType] && descriptions[enumType][value] || value;
};

module.exports = {
  AD_PLAN,
  USER_ROLES,
  AD_CREATIVE_STATUS,
  getEnumValues,
  getEnumOptions,
  isValidEnumValue,
  getEnumDescription
};