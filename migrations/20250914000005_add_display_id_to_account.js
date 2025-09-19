/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('account', function(table) {
    table.string('display_id', 50).notNullable().unique();
    table.index('display_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('account', function(table) {
    table.dropIndex('display_id');
    table.dropUnique('display_id');
    table.dropColumn('display_id');
  });
};