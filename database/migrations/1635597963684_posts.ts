import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Posts extends BaseSchema {
  protected tableName = 'posts'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title', 100).notNullable()
      table.string('slug', 255).unique().notNullable()
      table.string('page_title', 100).nullable()
      table.string('description', 255).nullable()
      table.string('meta_description', 255).nullable()
      table.string('canonical', 255).nullable()
      table.text('body').nullable()
      table.string('video_url', 255).nullable()
      table.boolean('is_featured').nullable().defaultTo(false);
      table.boolean('is_personal').nullable().defaultTo(false);
      table.integer('view_count').nullable().defaultTo(0)
      table.integer('view_count_unique').nullable().defaultTo(0)
      table.integer('state_id').unsigned().notNullable()
      table.string('timezone', 50).nullable()
      table.string('publish_at_user').nullable()
      table.timestamp('publish_at').nullable()

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
