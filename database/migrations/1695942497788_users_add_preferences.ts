import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_enabled_profile').notNullable().defaultTo(true)
      table.boolean('is_enabled_mini_player').notNullable().defaultTo(true)
      table.boolean('is_enabled_autoplay_next').notNullable().defaultTo(true)
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_enabled_profile')
      table.dropColumn('is_enabled_mini_player')
      table.dropColumn('is_enabled_autoplay_next')
    })
  }
}
