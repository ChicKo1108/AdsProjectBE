/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('account', function(table) {
    table.string('name', 100).notNullable().defaultTo('');
    table.index('name');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('account', function(table) {
    table.dropIndex('name');
    table.dropColumn('name');
  });
};