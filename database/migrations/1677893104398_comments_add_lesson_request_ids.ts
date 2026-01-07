import { BaseSchema } from '@adonisjs/lucid/schema'
import CommentTypes from '#enums/comment_types'

export default class extends BaseSchema {
  protected tableName = 'comments'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('post_id').nullable().alter()
      table.integer('lesson_request_id').nullable().references('lesson_requests.id').onDelete('CASCADE')
      table.integer('comment_type_id').notNullable().references('comment_types.id').onDelete('CASCADE').defaultTo(CommentTypes.POST)
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('post_id').notNullable().alter()
      table.dropColumn('lesson_request_id')
      table.dropColumn('comment_type_id')
    })
  }
}
