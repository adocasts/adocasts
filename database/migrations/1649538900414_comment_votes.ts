import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CommentVotes extends BaseSchema {
  protected tableName = 'comment_votes'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('users.id')
      table.integer('comment_id').unsigned().references('comments.id')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      table.unique(['user_id', 'comment_id'])
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
