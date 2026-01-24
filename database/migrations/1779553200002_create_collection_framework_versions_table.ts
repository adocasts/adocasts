import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'collection_framework_versions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('collection_id')
        .unsigned()
        .references('id')
        .inTable('collections')
        .notNullable()
      table
        .integer('framework_version_id')
        .unsigned()
        .references('id')
        .inTable('framework_versions')
        .notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
