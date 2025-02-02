import VideoTypes from '#enums/video_types'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'posts'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('video_type_id').notNullable().defaultTo(VideoTypes.NONE).alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('video_type_id').notNullable().defaultTo(VideoTypes.YOUTUBE).alter()
    })
  }
}
