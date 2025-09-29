import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'discussion_views'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.index(['discussion_id', 'type_id'], 'idx_discussion_views_discussion_id_type_id')
      table.index('discussion_id', 'idx_discussion_views_discussion_id')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['discussion_id', 'type_id'], 'idx_discussion_views_discussion_id_type_id')
      table.dropIndex('discussion_id', 'idx_discussion_views_discussion_id')
    })
  }
}
