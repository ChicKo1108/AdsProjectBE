exports.up = function(knex) {
  return knex.schema.alterTable('ad_plan', function(table) {
    table.integer('account_id').unsigned().notNullable().comment('关联的账户ID');
    table.foreign('account_id').references('id').inTable('account').onDelete('CASCADE').onUpdate('CASCADE');
    table.index('account_id');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('ad_plan', function(table) {
    table.dropForeign('account_id');
    table.dropIndex('account_id');
    table.dropColumn('account_id');
  });
};