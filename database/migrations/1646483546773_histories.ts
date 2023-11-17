import { BaseSchema } from '@adonisjs/lucid/schema'
import HistoryTypes from '#enums/history_types'

export default class Histories extends BaseSchema {
  protected tableName = 'histories'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('users.id').notNullable()
      table.integer('post_id').unsigned().references('posts.id')
      table.integer('collection_id').unsigned().references('collections.id')
      table.integer('taxonomy_id').unsigned().references('taxonomies.id')
      table.integer('history_type_id').unsigned().notNullable().defaultTo(HistoryTypes.VIEW)
      table.string('route').notNullable()
      table.integer('read_percent').unsigned()
      table.integer('watch_percent').unsigned()
      table.boolean('is_completed').notNullable().defaultTo(false)

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
