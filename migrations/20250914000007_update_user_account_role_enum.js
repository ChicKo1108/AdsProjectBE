/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('user_account', function(table) {
    // 先删除原有的role字段
    table.dropColumn('role');
  }).then(() => {
    // 重新添加role字段，调整账户级别权限
    return knex.schema.alterTable('user_account', function(table) {
      table.enum('role', ['site_admin', 'ad_operator']).defaultTo('ad_operator').comment('用户在该账户中的角色：站点管理员/广告操作员');
    });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('user_account', function(table) {
    // 回滚时恢复原有的role字段
    table.dropColumn('role');
  }).then(() => {
    return knex.schema.alterTable('user_account', function(table) {
      table.enum('role', ['site_admin', 'ad_operator']).defaultTo('ad_operator').comment('用户在该账户中的角色：站点管理员/广告操作员');
    });
  });
};