
exports.up = function(knex) {
  return knex.schema.createTable('ad_plan_ad_group', function(table) {
    table.increments('id').primary();
    table.integer('ad_plan_id').unsigned().notNullable().references('id').inTable('ad_plan').onDelete('CASCADE');
    table.integer('ad_group_id').unsigned().notNullable().references('id').inTable('ad_group').onDelete('CASCADE');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('ad_plan_ad_group');
};
