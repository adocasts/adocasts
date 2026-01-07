import { BaseSchema } from '@adonisjs/lucid/schema'

export default class ProfilesAddEmailSettings extends BaseSchema {
  protected tableName = 'profiles'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('email_on_comment').defaultTo(true);
      table.boolean('email_on_comment_reply').defaultTo(true);
      table.boolean('email_on_achievement').defaultTo(true);
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('email_on_comment');
      table.dropColumn('email_on_comment_reply');
      table.dropColumn('email_on_achievement');
    })
  }
}
