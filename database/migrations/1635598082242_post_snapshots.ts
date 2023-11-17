import { BaseSchema } from '@adonisjs/lucid/schema'

export default class PostHistories extends BaseSchema {
  protected tableName = 'post_snapshots'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('post_id').unsigned().references('id').inTable('posts').notNullable()
      table.integer('revision').notNullable()
      table.timestamp('revision_date').notNullable()
      table.integer('revised_by').unsigned().notNullable()
      table.string('title', 100).notNullable()
      table.string('slug', 255).notNullable()
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
      table.timestamp('deleted_at').nullable()

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
