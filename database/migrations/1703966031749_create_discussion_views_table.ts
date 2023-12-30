import DiscussionViewTypes from '#enums/discussion_view_types'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'discussion_views'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.integer('discussion_id').unsigned().references('id').inTable('discussions').notNullable()
      table.integer('type_id').unsigned().notNullable().defaultTo(DiscussionViewTypes.VIEW)
      table.string('ip_address', 45).notNullable()
      table.string('user_agent', 255).notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}