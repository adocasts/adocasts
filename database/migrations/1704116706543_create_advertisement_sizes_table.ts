import AdvertisementSizes from '#enums/advertisement_sizes'
import { BaseSchema } from '@adonisjs/lucid/schema'
import { DateTime } from 'luxon'

export default class extends BaseSchema {
  protected tableName = 'advertisement_sizes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 50).notNullable()
      table.integer('width').notNullable()
      table.integer('height').notNullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })

    this.defer(async (db) => {
      await db.table(this.tableName).multiInsert([{
        id: AdvertisementSizes.LEADERBOARD,
        name: 'Leaderboard',
        width: 728,
        height: 90,
        created_at: DateTime.now().toSQL(),
        updated_at: DateTime.now().toSQL(),
      }, {
        id: AdvertisementSizes.MEDIUM_RECTANGLE,
        name: 'Medium Rectangle',
        width: 300,
        height: 250,
        created_at: DateTime.now().toSQL(),
        updated_at: DateTime.now().toSQL(),
      }, {
        id: AdvertisementSizes.SKYSCRAPER,
        name: 'Skyscraper',
        width: 120,
        height: 600,
        created_at: DateTime.now().toSQL(),
        updated_at: DateTime.now().toSQL(),
      }])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}