import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'remember_me_tokens'

  async up() {
    this.schema.dropTable(this.tableName)
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('tokenable_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.string('hash').notNullable().unique()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
      table.timestamp('expires_at').notNullable()
    })
  }

  async down() {
    // this.schema.dropTable(this.tableName)
  }
}
