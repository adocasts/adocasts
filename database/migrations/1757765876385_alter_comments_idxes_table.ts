import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'comments'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.index(['discussion_id', 'state_id'], 'idx_comments_discussion_id_state_id')
      table.index(['post_id', 'state_id'], 'idx_comments_post_id_state_id')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['discussion_id', 'state_id'], 'idx_comments_discussion_id_state_id')
      table.dropIndex(['post_id', 'state_id'], 'idx_comments_post_id_state_id')
    })
  }
}
