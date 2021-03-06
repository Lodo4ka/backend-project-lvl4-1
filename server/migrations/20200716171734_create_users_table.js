// @ts-check

exports.up = (knex) => (
  knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('first_name');
    table.string('last_name');
    table.string('email');
    table.string('password_digest');
    table.timestamps(true, true);
  })
);

exports.down = (knex) => knex.schema.dropTable('users');
