import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Topics extends BaseSchema {
  protected tableName = 'taxonomies'
  protected tableName2 = 'collections'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_featured').notNullable().defaultTo(false)
    })

    this.schema.alterTable(this.tableName2, (table) => {
      table.boolean('is_featured').notNullable().defaultTo(false)
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_featured')
    })

    this.schema.alterTable(this.tableName2, (table) => {
      table.dropColumn('is_featured')
    })
  }
}
