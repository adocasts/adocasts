import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'posts'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('video_bunny_path', 'video_bunny_id')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('video_bunny_id', 'video_bunny_path')
    })
  }
}
