import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'session_logs'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_remember_session').notNullable().defaultTo(false)
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_remember_session')
    })
  }
}
