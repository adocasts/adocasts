import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('github_access_token')
      table.dropColumn('google_access_token')
      table.dropColumn('twitter_access_token')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('github_access_token')
      table.string('google_access_token')
      table.string('twitter_access_token')
    })
  }
}
