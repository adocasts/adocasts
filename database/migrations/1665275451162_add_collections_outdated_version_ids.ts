import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Collections extends BaseSchema {
  protected tableName = 'collections'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('outdated_version_id').unsigned().references('id').inTable('collections')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('outdated_version_id')
    })
  }
}
