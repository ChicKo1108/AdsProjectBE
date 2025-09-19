/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // 清空现有数据
  await knex('ad_group').del();
  
  // 插入测试数据
  await knex('ad_group').insert([
    {
      id: 1,
      name: '移动应用推广组',
      account_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: '游戏推广组',
      account_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: '电商推广组',
      account_id: 2,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      name: '教育推广组',
      account_id: 2,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      name: '金融推广组',
      account_id: 3,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};