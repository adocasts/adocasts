import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'session_logs'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('browser_name', 50).nullable()
      table.string('browser_engine', 50).nullable()
      table.string('browser_version', 50).nullable()
      table.string('device_model', 50).nullable()
      table.string('device_type', 50).nullable()
      table.string('device_vendor', 50).nullable()
      table.string('os_name', 50).nullable()
      table.string('os_version', 50).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('browser_name')
      table.dropColumn('browser_engine')
      table.dropColumn('browser_version')
      table.dropColumn('device_model')
      table.dropColumn('device_type')
      table.dropColumn('device_vendor')
      table.dropColumn('os_name')
      table.dropColumn('os_version')
    })
  }
}
