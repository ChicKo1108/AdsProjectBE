/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // 清空现有数据
  await knex('account').del();
  
  // 插入测试数据
  await knex('account').insert([
    {
      id: 1,
      name: '移动应用推广账户',
      display_id: 'ACC_MOBILE_001',
      balance: 10000.00,
      today_cost: 150.50,
      account_daily_budget: 500.00,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: '电商营销账户',
      display_id: 'ACC_ECOM_002',
      balance: 8500.00,
      today_cost: 220.75,
      account_daily_budget: 800.00,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: '金融服务推广账户',
      display_id: 'ACC_FIN_003',
      balance: 15000.00,
      today_cost: 95.30,
      account_daily_budget: 300.00,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};