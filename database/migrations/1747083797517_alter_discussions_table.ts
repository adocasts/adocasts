import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'discussions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('solved_at').nullable()
      table.integer('solved_comment_id').unsigned().references('id').inTable('comments').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('solved_at')
      table.dropColumn('solved_comment_id')
    })
  }
}
