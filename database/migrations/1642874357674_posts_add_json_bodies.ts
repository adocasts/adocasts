import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import BodyTypes from 'App/Enums/BodyTypes'

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
