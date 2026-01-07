import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'post_chapters'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('post_id').unsigned().references('id').inTable('posts').notNullable()
      table.string('start', 10).notNullable()
      table.string('end', 10).notNullable()
      table.string('text', 100).notNullable()
      table.integer('sort_order').notNullable().defaultTo(0)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
