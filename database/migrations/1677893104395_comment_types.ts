import { BaseSchema } from '@adonisjs/lucid/schema'
import CommentTypes from '#enums/comment_types'

export default class extends BaseSchema {
  protected tableName = 'comment_types'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 50).notNullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })

    this.defer(async (db) => {
      await db.table(this.tableName).multiInsert([{
        id: CommentTypes.POST,
        name: 'Post',
      }, {
        id: CommentTypes.LESSON_REQUEST,
        name: 'Lesson Request',
      }])
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
