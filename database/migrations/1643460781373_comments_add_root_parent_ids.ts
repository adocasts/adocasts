import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CommentsAddRootParentIds extends BaseSchema {
  protected tableName = 'comments'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('root_parent_id').unsigned().references('id').inTable('comments')
      table.integer('level_index').notNullable().defaultTo(0)
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('root_parent_id')
      table.dropColumn('level_index')
    })
  }
}
