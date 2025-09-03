import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'posts'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('updated_content_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (_table) => {})
  }
}
