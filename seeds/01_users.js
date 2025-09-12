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
      username: 'admin',
      password: adminPassword,
      name: '系统管理员',
      role: 'super-admin',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      username: 'manager',
      password: hashedPassword,
      name: '广告经理',
      role: 'admin',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      username: 'user1',
      password: hashedPassword,
      name: '普通用户1',
      role: 'user',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      username: 'user2',
      password: hashedPassword,
      name: '普通用户2',
      role: 'user',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};