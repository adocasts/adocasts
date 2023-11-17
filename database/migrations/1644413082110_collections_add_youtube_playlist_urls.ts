import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Collections extends BaseSchema {
  protected tableName = 'collections'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('youtube_playlist_url')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('youtube_playlist_url')
    })
  }
}
