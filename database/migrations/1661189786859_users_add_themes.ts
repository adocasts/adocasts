import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import Themes from 'App/Enums/Themes'

export default class Users extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('theme', 50).notNullable().defaultTo(Themes.SYSTEM)
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('theme')
    })
  }
}
