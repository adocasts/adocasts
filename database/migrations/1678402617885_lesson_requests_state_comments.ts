import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'lesson_requests'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('approve_comment_id').unsigned().references('id').inTable('comments').nullable()
      table.integer('reject_comment_id').unsigned().references('id').inTable('comments').nullable()
      table.integer('complete_comment_id').unsigned().references('id').inTable('comments').nullable()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('approve_comment_id', 'reject_comment_id', 'complete_comment_id')
    })
  }
}
