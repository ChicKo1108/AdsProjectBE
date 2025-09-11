
exports.up = function(knex) {
  return knex.schema.createTable('ad_plan', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('plan_type');
    table.integer('target').defaultTo(0);
    table.integer('price_stratagy').defaultTo(0);
    table.string('placement_type');
    table.integer('status').defaultTo(0);
    table.integer('chuang_yi_you_xuan').defaultTo(0);
    table.decimal('budget', 14, 2);
    table.decimal('cost', 14, 2);
    table.integer('display_count');
    table.integer('click_count');
    table.integer('download_count');
    table.decimal('click_per_price', 14, 2);
    table.decimal('click_rate', 5, 2);
    table.decimal('ecpm', 14, 2);
    table.decimal('download_per_count', 14, 2);
    table.decimal('dounload_count', 5, 2);
    table.timestamp('start_date');
    table.timestamp('end_date');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('ad_plan');
};
