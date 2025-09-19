/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // 清空现有数据
  await knex('user_account').del();
  
  // 插入用户-账户关联数据
  await knex('user_account').insert([
    {
      id: 1,
      user_id: 2, // siteadmin1 - 账户管理员1
      account_id: 1, // 移动应用推广账户
      role: 'site_admin',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      user_id: 2, // siteadmin1 - 同时管理多个账户
      account_id: 2, // 电商营销账户
      role: 'site_admin',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      user_id: 3, // operator1 - 广告操作员1
      account_id: 1, // 移动应用推广账户
      role: 'ad_operator',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      user_id: 3, // operator1 - 在另一个账户中也是操作员
      account_id: 3, // 金融服务推广账户
      role: 'ad_operator',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      user_id: 4, // operator2 - 广告操作员2
      account_id: 2, // 电商营销账户
      role: 'ad_operator',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 6,
      user_id: 4, // operator2 - 在金融账户中是管理员
      account_id: 3, // 金融服务推广账户
      role: 'site_admin',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 7,
      user_id: 5, // testuser - 测试用户，暂时无权限（非激活状态）
      account_id: 1, // 移动应用推广账户
      role: 'ad_operator',
      is_active: false, // 非激活状态，用于测试权限验证
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};