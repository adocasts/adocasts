import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Assets extends BaseSchema {
  protected tableName = 'assets'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('asset_type_id').unsigned().notNullable()
      table.string('filename').notNullable()
      table.integer('byte_size').notNullable()
      table.string('alt_text').nullable()
      table.string('credit').nullable()

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
