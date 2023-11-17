import { BaseSchema } from '@adonisjs/lucid/schema'

export default class PostTopics extends BaseSchema {
  protected tableName = 'post_topics'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('post_id').unsigned().references('id').inTable('posts').notNullable()
      table.integer('topic_id').unsigned().references('id').inTable('topics').notNullable()
      table.integer('sort_order').notNullable()

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
