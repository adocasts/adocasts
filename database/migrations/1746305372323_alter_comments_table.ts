import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'comments'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('identity').nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, () => {})
  }
}
