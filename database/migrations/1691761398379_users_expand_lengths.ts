import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('username', 100).notNullable().alter()
      table.string('email', 500).nullable().alter()
      table.string('password', 500).nullable().alter()
      table.string('google_email', 500).nullable().alter()
      table.string('github_email', 500).nullable().alter()
      table.string('email_verified', 500).nullable().alter()
      table.string('avatar_url', 500).nullable().alter()
      table.string('google_access_token', 500).nullable().alter()
      table.string('github_access_token', 500).nullable().alter()
      table.string('twitter_access_token', 500).nullable().alter()

      table.string('stripe_subscription_status', 25).nullable()
      table.timestamp('stripe_subscription_paused_at').nullable()
      table.timestamp('stripe_subscription_canceled_at').nullable()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('username', 50).notNullable().alter()
      table.string('email', 255).notNullable().alter()
      table.string('password', 180).nullable().alter()
      table.string('google_email', 255).nullable().alter()
      table.string('github_email', 255).nullable().alter()
      table.string('email_verified', 255).nullable().alter()
      table.string('avatar_url', 255).nullable().alter()
      table.string('google_access_token', 255).nullable().alter()
      table.string('github_access_token', 255).nullable().alter()
      table.string('twitter_access_token', 255).nullable().alter()

      table.dropColumn('stripe_subscription_status')
      table.dropColumn('stripe_subscription_paused_at')
      table.dropColumn('stripe_subscription_canceled_at')
    })
  }
}
