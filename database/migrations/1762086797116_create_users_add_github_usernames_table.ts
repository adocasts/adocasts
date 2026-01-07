import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('github_team_invite_status').nullable()
      table.string('github_team_invite_username').nullable()
      table.string('github_team_invite_user_id').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('github_team_invite_status')
      table.dropColumn('github_team_invite_username')
      table.dropColumn('github_team_invite_user_id')
    })
  }
}
