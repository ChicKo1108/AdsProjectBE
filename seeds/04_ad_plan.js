/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // 清空现有数据
  await knex('ad_plan').del();
  
  // 插入测试数据
  // target: app, web, quick_app, mini_app, download
  // price_stratagy: stable_cost, max_conversion, optimal_cost
  await knex('ad_plan').insert([
    {
      id: 1,
      name: '春季促销广告计划',
      plan_type: 'CPC',
      target: 'app',
      price_stratagy: 'stable_cost',
      placement_type: 'feed',
      status: 1,
      chuang_yi_you_xuan: 0,
      budget: 1000.00,
      cost: 250.50,
      display_count: 15000,
      click_count: 450,
      download_count: 85,
      click_per_price: 0.56,
      click_rate: 3.0,
      ecpm: 16.70,
      download_per_count: 2.94,
      download_rate: 18.89,
      start_date: new Date('2024-03-01'),
      end_date: new Date('2024-03-31'),
      account_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: '夏季游戏推广计划',
      plan_type: 'CPM',
      target: 'app',
      price_stratagy: 'max_conversion',
      placement_type: 'banner',
      status: 1,
      chuang_yi_you_xuan: 1,
      budget: 2000.00,
      cost: 1200.75,
      display_count: 50000,
      click_count: 1200,
      download_count: 180,
      click_per_price: 1.00,
      click_rate: 2.4,
      ecpm: 24.02,
      download_per_count: 6.67,
      download_rate: 15.0,
      start_date: new Date('2024-06-01'),
      end_date: new Date('2024-08-31'),
      account_id: 2,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: '电商双11预热计划',
      plan_type: 'CPA',
      target: 'web',
      price_stratagy: 'optimal_cost',
      placement_type: 'interstitial',
      status: 0,
      chuang_yi_you_xuan: 0,
      budget: 5000.00,
      cost: 0.00,
      display_count: 0,
      click_count: 0,
      download_count: 0,
      click_per_price: 0.00,
      click_rate: 0.0,
      ecpm: 0.00,
      download_per_count: 0.00,
      download_rate: 0.0,
      start_date: new Date('2024-10-15'),
      end_date: new Date('2024-11-15'),
      account_id: 3,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};