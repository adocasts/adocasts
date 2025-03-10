import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'profiles'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('email_on_watchlist').notNullable().defaultTo(true)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('email_on_watchlist')
    })
  }
}