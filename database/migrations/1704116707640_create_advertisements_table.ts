import States from '#enums/states'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'advertisements'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').notNullable()
      table.integer('asset_id').unsigned().references('id').inTable('assets').notNullable()
      table.integer('size_id').unsigned().references('id').inTable('advertisement_sizes').notNullable()
      table.integer('state_id').unsigned().notNullable().defaultTo(States.PUBLIC)
      table.string('url', 250).notNullable()
      table.timestamp('start_at', { useTz: true }).notNullable()
      table.timestamp('end_at', { useTz: true }).notNullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}