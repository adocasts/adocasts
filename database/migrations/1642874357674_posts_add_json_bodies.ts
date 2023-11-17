import { BaseSchema } from '@adonisjs/lucid/schema'
import BodyTypes from '#enums/body_types'

export default class PostsAddJsonBodies extends BaseSchema {
  protected tableName = 'posts'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.jsonb('body_blocks').nullable()
      table.integer('body_type_id').notNullable().defaultTo(BodyTypes.HTML)
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('body_blocks')
      table.dropColumn('body_type_id')
    })
  }
}
