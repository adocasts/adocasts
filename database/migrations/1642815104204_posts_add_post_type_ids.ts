import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AlterPostsAddPostTypeIds extends BaseSchema {
  protected tableName = 'posts'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('post_type_id').unsigned().notNullable().defaultTo(1)
      table.string('redirect_url').nullable()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('post_type_id')
      table.dropColumn('redirect_url')
    })
  }
}
