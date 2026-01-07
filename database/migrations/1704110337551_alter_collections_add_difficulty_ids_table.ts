import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'collections'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('difficulty_id').unsigned()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('difficulty_id')
    })
  }
}