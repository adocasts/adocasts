import { BaseSchema } from '@adonisjs/lucid/schema'

export default class QuestionVotes extends BaseSchema {
  protected tableName = 'question_votes'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('users.id')
      table.integer('question_id').unsigned().references('questions.id')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      table.unique(['user_id', 'question_id'])
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
