
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('ad_plan', function(table) {
    // 修改target字段为字符串枚举
    table.dropColumn('target');
  })
  .then(() => {
    return knex.schema.alterTable('ad_plan', function(table) {
      table.enum('target', ['mobile_app', 'game', 'ecommerce', 'education', 'finance']).defaultTo('mobile_app');
    });
  })
  .then(() => {
    return knex.schema.alterTable('ad_plan', function(table) {
      // 修改price_stratagy字段为字符串枚举
      table.dropColumn('price_stratagy');
    });
  })
  .then(() => {
    return knex.schema.alterTable('ad_plan', function(table) {
      table.enum('price_stratagy', ['auto_bid', 'manual_bid']).defaultTo('auto_bid');
    });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('ad_plan', function(table) {
    // 回滚：恢复为整数类型
    table.dropColumn('target');
    table.integer('target').defaultTo(0);
    
    table.dropColumn('price_stratagy');
    table.integer('price_stratagy').defaultTo(0);
  });
};
