import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Taxonomies extends BaseSchema {
  protected tableName = 'taxonomies'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('parent_id').unsigned().references('id').inTable(this.tableName).nullable()
      table.integer('asset_id').unsigned().references('id').inTable('assets').nullable()
      table.string('name', 50).notNullable()
      table.string('slug', 100).notNullable()
      table.string('description', 255).notNullable().defaultTo('')
      table.string('page_title', 100).notNullable().defaultTo('')
      table.string('meta_description', 255).notNullable().defaultTo('')

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
