import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'session_logs'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('session_id').nullable()
      table
        .integer('remember_me_token_id')
        .unsigned()
        .references('id')
        .inTable('remember_me_tokens')
        .nullable()
        .onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('session_id')
      table.dropColumn('remember_me_token_id')
    })
  }
}
