import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'profiles'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('threads_url', 255).nullable().defaultTo('')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('threads_url')
    })
  }
}
