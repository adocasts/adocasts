import CommentTypes from '#enums/comment_types'
import CommentType from '#models/comment_type'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'comments'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('discussion_id').unsigned().references('id').inTable('discussions')
    })

    this.defer(async () => {
      const discussionType = await CommentType.find(CommentTypes.DISCUSSION)
      
      if (!discussionType) {
        await CommentType.create({ id: CommentTypes.DISCUSSION, name: 'discussion' })
      }
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('discussion_id')
    })
  }
}