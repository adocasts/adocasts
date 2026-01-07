import { BaseSchema } from '@adonisjs/lucid/schema'
import VideoTypes from '#enums/video_types'

export default class extends BaseSchema {
  protected tableName = 'posts'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('video_type_id').unsigned().notNullable().defaultTo(VideoTypes.YOUTUBE)
      table.string('video_bunny_path', 500).nullable()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('video_type_id')
      table.dropColumn('video_bunny_path')
    })
  }
}
