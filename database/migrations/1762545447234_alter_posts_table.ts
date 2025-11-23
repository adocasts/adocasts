import RepositoryAccessLevels from '#enums/repository_access_levels'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'posts'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('repository_access_level')
        .unsigned()
        .notNullable()
        .defaultTo(RepositoryAccessLevels.PUBLIC)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('repository_access_level')
    })
  }
}
