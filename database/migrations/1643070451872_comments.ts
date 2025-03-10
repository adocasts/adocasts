import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Comments extends BaseSchema {
  protected tableName = 'comments'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').nullable()
      table.integer('post_id').unsigned().references('id').inTable('posts').notNullable()
      table.integer('user_id').unsigned().references('id').inTable('users').nullable()
      table.integer('reply_to').unsigned().references('id').inTable('comments').nullable()
      table.integer('state_id').unsigned().notNullable()
      table.string('identity').notNullable()
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
