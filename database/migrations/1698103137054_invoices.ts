import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'invoices'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').notNullable()
      table.string('invoice_id').notNullable().unique()
      table.string('invoice_number').notNullable()
      table.string('charge_id')
      table.integer('amount_due').notNullable().defaultTo(0)
      table.integer('amount_paid').notNullable().defaultTo(0)
      table.integer('amount_remaining').notNullable().defaultTo(0)
      table.string('status')
      table.boolean('paid')
      table.timestamp('period_start_at')
      table.timestamp('period_end_at')

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
