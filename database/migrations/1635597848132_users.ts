import { BaseSchema } from '@adonisjs/lucid/schema'

export default class UsersSchema extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('role_id').unsigned().references('id').inTable('roles').notNullable().defaultTo(1)
      table.string('username', 50).notNullable().unique()
      table.string('email', 255).notNullable()
      table.string('password', 180).nullable()
      table.string('remember_me_token').nullable()
      table.string('avatar_url');
      table.string('github_access_token');
      table.string('google_access_token');
      table.string('twitter_access_token');

      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
