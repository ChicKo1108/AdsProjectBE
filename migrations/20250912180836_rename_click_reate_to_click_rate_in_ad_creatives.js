
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('ad_creatives', function(table) {
    table.renameColumn('click_reate', 'click_rate');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('ad_creatives', function(table) {
    table.renameColumn('click_rate', 'click_reate');
  });
};
