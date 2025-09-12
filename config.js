// 加载环境变量
require('dotenv').config({
  path: process.env.NODE_ENV === 'production' 
    ? '.env.production' 
    : '.env.development'
});

const configs = {
  // 应用配置
  app: {
    name: process.env.APP_NAME || '广告管理平台',
    version: process.env.APP_VERSION || '1.0.0',
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },

  // 数据库配置
  mysql: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || '3306',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootroot',
    database: process.env.DB_NAME || 'ads',
    charset: process.env.DB_CHARSET || 'utf8mb4'
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'ad_platform_jwt_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    filePath: process.env.LOG_FILE_PATH || './logs/app.log'
  },

  // 跨域配置
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: process.env.CORS_CREDENTIALS === 'true'
  },

  // API配置
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
    timeout: parseInt(process.env.API_TIMEOUT) || 30000
  }
};

module.exports = configs;