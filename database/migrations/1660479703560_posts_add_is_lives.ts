import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Posts extends BaseSchema {
  protected tableName = 'posts'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_live').notNullable().defaultTo(false)
      table.string('livestream_url').nullable()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_live')
      table.dropColumn('livestream_url')
    })
  }
}
