import TaxonomyTypes from '#enums/taxonomy_types'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'taxonomies'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('taxonomy_type_id').unsigned().notNullable().defaultTo(TaxonomyTypes.CONTENT)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('taxonomy_type_id')
    })
  }
}
