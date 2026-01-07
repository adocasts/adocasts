import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Posts extends BaseSchema {
  protected tableName = 'posts'
  protected tableName2 = 'collections'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('repository_url')
    })

    this.schema.alterTable(this.tableName2, (table) => {
      table.string('repository_url')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('repository_url')
    })

    this.schema.alterTable(this.tableName2, (table) => {
      table.dropColumn('repository_url')
    })
  }
}
