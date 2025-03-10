import { BaseSchema } from '@adonisjs/lucid/schema'

export default class PostsReadtimes extends BaseSchema {
  protected tableName = 'posts'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('read_minutes').unsigned().notNullable().defaultTo(0)
      table.integer('read_time').unsigned().notNullable().defaultTo(0)
      table.integer('word_count').unsigned().notNullable().defaultTo(0)
      table.integer('video_seconds').unsigned().notNullable().defaultTo(0)
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('read_minutes')
      table.dropColumn('read_time')
      table.dropColumn('word_count')
      table.dropColumn('video_seconds')
    })
  }
}
