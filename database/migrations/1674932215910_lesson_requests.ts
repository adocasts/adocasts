import { BaseSchema } from '@adonisjs/lucid/schema'
import RequestPriorities from '#enums/request_priorities'
import State from '#enums/states'

export default class extends BaseSchema {
  protected tableName = 'lesson_requests'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').notNullable()
      table.integer('state_id').unsigned().notNullable().defaultTo(State.IN_REVIEW)
      table.integer('priority').unsigned().notNullable().defaultTo(RequestPriorities.NORMAL)
      table.string('name').notNullable()
      table.text('body')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
