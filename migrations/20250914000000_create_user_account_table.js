/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('user_account', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.integer('account_id').unsigned().notNullable();
    table.enum('role', ['site_admin', 'ad_operator']).defaultTo('ad_operator').comment('用户在该账户中的角色：站点管理员/广告操作员');
    table.boolean('is_active').defaultTo(true).comment('关联是否激活');
    table.timestamps(true, true);
    
    // 外键约束
    table.foreign('user_id').references('id').inTable('user').onDelete('CASCADE');
    table.foreign('account_id').references('id').inTable('account').onDelete('CASCADE');
    
    // 复合唯一索引，确保一个用户不能重复绑定同一个账户
    table.unique(['user_id', 'account_id']);
    
    // 索引优化查询性能
    table.index(['user_id']);
    table.index(['account_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('user_account');
};