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
      balance: 10000.00,
      today_cost: 150.50,
      account_daily_budget: 500.00,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};