
exports.up = function(knex) {
  return knex.schema.createTable('ad_creatives', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('display_id');
    table.integer('status');
    table.decimal('budget', 14, 2);
    table.decimal('download_cost', 14, 2);
    table.decimal('click_cost', 14, 2);
    table.decimal('costs', 14, 2);
    table.integer('download_count');
    table.decimal('download_rate', 5, 2);
    table.decimal('ecpm', 14, 2);
    table.integer('display_count');
    table.integer('click_count');
    table.decimal('click_reate', 5, 2);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('ad_creatives');
};
