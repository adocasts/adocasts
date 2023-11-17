import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Histories extends BaseSchema {
  protected tableName = 'histories'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('watch_seconds').unsigned().notNullable().defaultTo(0)
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('watch_seconds')
    })
  }
}
