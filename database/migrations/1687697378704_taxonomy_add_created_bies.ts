import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Taxonomy extends BaseSchema {
  protected tableName = 'taxonomies'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('owner_id').unsigned().references('id').inTable('users').notNullable().defaultTo(1)
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('owner_id')
    })
  }
}
