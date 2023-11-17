import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'session_logs'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').references('id').inTable('users').notNullable()
      table.string('token').notNullable()
      table.string('ip_address', 50).nullable()
      table.string('user_agent').nullable()
      table.string('city').nullable()
      table.string('country').nullable()
      table.string('country_code').nullable()
      table.timestamp('login_at').nullable()
      table.boolean('login_successful').notNullable().defaultTo(false)
      table.timestamp('logout_at').nullable()
      table.boolean('force_logout').notNullable().defaultTo(false)
      table.timestamp('last_touched_at').nullable()

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
