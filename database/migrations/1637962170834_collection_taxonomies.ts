import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CollectionTaxonomies extends BaseSchema {
  protected tableName = 'collection_taxonomies'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('collection_id').unsigned().references('id').inTable('collections')
      table.integer('taxonomy_id').unsigned().references('id').inTable('taxonomies')
      table.integer('sort_order').notNullable().defaultTo(0)

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
