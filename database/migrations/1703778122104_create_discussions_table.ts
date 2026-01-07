import States from '#enums/states'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'discussions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').notNullable()
      table.integer('taxonomy_id').unsigned().references('id').inTable('taxonomies')
      table.integer('state_id').unsigned().notNullable().defaultTo(States.PUBLIC)
      table.string('title', 100).notNullable().defaultTo('')
      table.string('slug', 200).notNullable().unique()
      table.text('body').notNullable().defaultTo('')
      table.integer('views').unsigned().notNullable().defaultTo(0)
      table.integer('impressions').unsigned().notNullable().defaultTo(0)

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}