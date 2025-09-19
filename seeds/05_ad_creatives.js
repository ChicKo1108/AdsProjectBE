/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // 清空现有数据
  await knex('ad_creatives').del();
  
  // 插入测试数据
  await knex('ad_creatives').insert([
    {
      id: 1,
      name: '春季促销横幅广告',
      display_id: 'SPRING_BANNER_001',
      status: 1,
      budget: 500.00,
      download_cost: 2.50,
      click_cost: 0.45,
      costs: 125.75,
      download_count: 50,
      download_rate: 12.5,
      ecpm: 15.50,
      display_count: 8000,
      click_count: 280,
      click_rate: 3.5,
      account_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: '游戏下载激励视频',
      display_id: 'GAME_VIDEO_002',
      status: 1,
      budget: 800.00,
      download_cost: 4.20,
      click_cost: 0.80,
      costs: 420.00,
      download_count: 100,
      download_rate: 20.0,
      ecpm: 28.00,
      display_count: 15000,
      click_count: 500,
      click_rate: 3.33,
      account_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: '电商产品展示广告',
      display_id: 'ECOM_DISPLAY_003',
      status: 0,
      budget: 1200.00,
      download_cost: 0.00,
      click_cost: 0.00,
      costs: 0.00,
      download_count: 0,
      download_rate: 0.0,
      ecpm: 0.00,
      display_count: 0,
      click_count: 0,
      click_rate: 0.0,
      account_id: 2,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      name: '教育APP推广信息流',
      display_id: 'EDU_FEED_004',
      status: 1,
      budget: 600.00,
      download_cost: 3.00,
      click_cost: 0.60,
      costs: 180.00,
      download_count: 60,
      download_rate: 15.0,
      ecpm: 18.00,
      display_count: 10000,
      click_count: 300,
      click_rate: 3.0,
      account_id: 2,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      name: '金融理财开屏广告',
      display_id: 'FIN_SPLASH_005',
      status: 1,
      budget: 1500.00,
      download_cost: 5.50,
      click_cost: 1.20,
      costs: 660.00,
      download_count: 120,
      download_rate: 24.0,
      ecpm: 33.00,
      display_count: 20000,
      click_count: 550,
      click_rate: 2.75,
      account_id: 3,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};