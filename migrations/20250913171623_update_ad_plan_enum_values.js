/**
 * 更新ad_plan表的枚举字段值
 * 修改target和price_stratagy字段的枚举选项
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('ad_plan', function(table) {
    // 删除现有的target字段
    table.dropColumn('target');
  })
  .then(() => {
    return knex.schema.alterTable('ad_plan', function(table) {
      // 重新创建target字段，使用新的枚举值
      table.enum('target', [
        'app',           // 应用推广
        'web',           // 网页推广
        'quick_app',     // 快应用推广
        'mini_app',      // 小程序推广
        'download'       // 应用下载
      ]).defaultTo('app').comment('推广目标：应用推广-app, 网页推广-web, 快应用推广-quick_app, 小程序推广-mini_app, 应用下载-download');
    });
  })
  .then(() => {
    return knex.schema.alterTable('ad_plan', function(table) {
      // 删除现有的price_stratagy字段
      table.dropColumn('price_stratagy');
    });
  })
  .then(() => {
    return knex.schema.alterTable('ad_plan', function(table) {
      // 重新创建price_stratagy字段，使用新的枚举值
      table.enum('price_stratagy', [
        'stable_cost',      // 稳定成本
        'max_conversion',   // 最大转化
        'optimal_cost'      // 最优成本
      ]).defaultTo('stable_cost').comment('竞价策略：稳定成本-stable_cost, 最大转化-max_conversion, 最优成本-optimal_cost');
    });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('ad_plan', function(table) {
    // 回滚：恢复到之前的枚举值
    table.dropColumn('target');
  })
  .then(() => {
    return knex.schema.alterTable('ad_plan', function(table) {
      table.enum('target', ['mobile_app', 'game', 'ecommerce', 'education', 'finance']).defaultTo('mobile_app');
    });
  })
  .then(() => {
    return knex.schema.alterTable('ad_plan', function(table) {
      table.dropColumn('price_stratagy');
    });
  })
  .then(() => {
    return knex.schema.alterTable('ad_plan', function(table) {
      table.enum('price_stratagy', ['auto_bid', 'manual_bid']).defaultTo('auto_bid');
    });
  });
};