#!/usr/bin/env node

/**
 * Environment Variable Loader
 * This script loads the appropriate .env file based on NODE_ENV
 */

const fs = require('fs');
const path = require('path');

// Determine which environment file to load
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env.development';
const envPath = path.join(__dirname, '..', envFile);

// Check if the environment file exists
if (!fs.existsSync(envPath)) {
  console.warn(`Warning: Environment file ${envFile} not found at ${envPath}`);
  console.warn('Please create the appropriate .env file or copy from .env.example');
  process.exit(1);
}

// Load the environment variables
require('dotenv').config({ path: envPath });

console.log(`✓ 已从 ${envFile} 加载环境变量`);
console.log(`✓ 运行模式: ${nodeEnv}`);
console.log(`✓ 数据库: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
console.log(`✓ 端口: ${process.env.PORT}`);

// 验证必需的环境变量
const requiredVars = [
  'DB_HOST',
  'DB_PORT', 
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('✗ 缺少必需的环境变量:');
  missingVars.forEach(varName => {
    console.error(`  - ${varName}`);
  });
  console.error('请检查你的 .env 文件并确保所有必需的变量都已设置。');
  process.exit(1);
}

console.log('✓ 所有必需的环境变量都已设置');