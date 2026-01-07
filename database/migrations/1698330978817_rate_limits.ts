import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'rate_limits'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.string('key', 255).notNullable().primary()
      table.integer('points', 9).notNullable()
      table.bigint('expire').unsigned()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
