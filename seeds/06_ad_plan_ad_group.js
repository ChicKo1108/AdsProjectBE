/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // 清空现有数据
  await knex('ad_plan_ad_group').del();
  
  // 插入测试数据 - 建立广告计划和广告组的关联关系
  await knex('ad_plan_ad_group').insert([
    {
      id: 1,
      ad_plan_id: 1, // 春季促销广告计划
      ad_group_id: 1, // 移动应用推广组
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      ad_plan_id: 1, // 春季促销广告计划
      ad_group_id: 3, // 电商推广组
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      ad_plan_id: 2, // 夏季游戏推广计划
      ad_group_id: 2, // 游戏推广组
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      ad_plan_id: 2, // 夏季游戏推广计划
      ad_group_id: 1, // 移动应用推广组
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      ad_plan_id: 3, // 电商双11预热计划
      ad_group_id: 3, // 电商推广组
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 6,
      ad_plan_id: 3, // 电商双11预热计划
      ad_group_id: 5, // 金融推广组
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};