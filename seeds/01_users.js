const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // 清空现有数据
  await knex('user').del();
  
  // 插入测试数据
  const hashedPassword = await bcrypt.hash('123456', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  await knex('user').insert([
    {
      id: 1,
      username: 'superadmin',
      password: adminPassword,
      name: '系统超级管理员',
      role: 'super-admin',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      username: 'siteadmin1',
      password: hashedPassword,
      name: '账户管理员1',
      role: 'user', // 普通用户，权限通过user_account表管理
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      username: 'operator1',
      password: hashedPassword,
      name: '广告操作员1',
      role: 'user', // 普通用户，权限通过user_account表管理
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      username: 'operator2',
      password: hashedPassword,
      name: '广告操作员2',
      role: 'user', // 普通用户，权限通过user_account表管理
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      username: 'testuser',
      password: hashedPassword,
      name: '测试用户',
      role: 'user', // 普通用户，无账户权限
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};