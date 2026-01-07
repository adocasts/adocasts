import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Notifications extends BaseSchema {
  protected tableName = 'notifications'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.boolean('global').notNullable().defaultTo(false)
      table.integer('user_id').unsigned().references('id').inTable('users').notNullable()
      table.integer('initiator_user_id').unsigned().references('id').inTable('users').nullable()
      table.integer('notification_type_id').unsigned().notNullable()
      table.string('table').nullable()
      table.integer('table_id').nullable()
      table.string('title').notNullable()
      table.text('body').notNullable()
      table.string('href').nullable()
      table.timestamp('read_at').nullable()
      table.timestamp('actioned_at').nullable()

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
