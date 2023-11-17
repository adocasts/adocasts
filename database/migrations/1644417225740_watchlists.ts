import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Watchlists extends BaseSchema {
  protected tableName = 'watchlists'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('users.id').notNullable()
      table.integer('post_id').unsigned().references('posts.id').nullable()
      table.integer('collection_id').unsigned().references('collections.id').nullable()
      table.integer('taxonomy_id').unsigned().references('taxonomies.id').nullable()

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
