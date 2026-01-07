import { BaseSchema } from '@adonisjs/lucid/schema'

export default class TaxonomiesAddRootParentIds extends BaseSchema {
  protected tableName = 'taxonomies'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('root_parent_id').unsigned().references('id').inTable(this.tableName).after('id')
      table.integer('level_index').unsigned()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('root_parent_id')
      table.dropColumn('level_index')
    })
  }
}
