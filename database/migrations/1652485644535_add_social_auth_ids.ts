import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Users extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('github_id').nullable()
      table.string('github_email').nullable()
      table.string('google_id').nullable()
      table.string('google_email').nullable()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('github_id')
      table.dropColumn('github_email')
      table.dropColumn('google_id')
      table.dropColumn('google_email')
    })
  }
}
