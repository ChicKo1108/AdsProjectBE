
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('account', function(table) {
    table.increments('id').primary();
    table.decimal('balance', 15, 2).defaultTo(0).comment('余额');
    table.decimal('today_cost', 15, 2).defaultTo(0).comment('今日广告消耗');
    table.decimal('account_daily_budget', 15, 2).defaultTo(0).comment('账户日预算');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('account');
};
