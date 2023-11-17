import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AuthorPosts extends BaseSchema {
  protected tableName = 'author_posts'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('post_id').unsigned().references('id').inTable('posts').notNullable()
      table.integer('user_id').unsigned().references('id').inTable('users').notNullable()
      table.integer('author_type_id').unsigned().defaultTo(1)

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
