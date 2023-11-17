import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AuthAttempts extends BaseSchema {
  protected tableName = 'auth_attempts'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('uid').notNullable()
      table.integer('purpose_id').notNullable().defaultTo(1);
      table.timestamp('deleted_at').nullable();

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
