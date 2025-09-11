
exports.up = function(knex) {
  return knex.schema.alterTable('ad_plan', function(table) {
    table.dropColumn('dounload_count');
    table.decimal('download_rate', 5, 2);
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('ad_plan', function(table) {
    table.dropColumn('download_rate');
    table.decimal('dounload_count', 5, 2);
  });
};
