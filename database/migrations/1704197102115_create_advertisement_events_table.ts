import AnalyticTypes from '#enums/analytic_types'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'advertisement_events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('type_id').notNullable().defaultTo(AnalyticTypes.IMPRESSION)
      table.integer('advertisement_id').references('id').inTable('advertisements').notNullable()
      table.string('identity', 100).notNullable()
      table.string('category', 50).notNullable().defaultTo('')
      table.string('action', 50).notNullable().defaultTo('')
      table.string('path').notNullable()
      table.string('host', 100).notNullable()
      table.string('browser', 50).notNullable().defaultTo('')
      table.string('browser_version', 50).notNullable().defaultTo('')
      table.string('os', 50).notNullable().defaultTo('')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}