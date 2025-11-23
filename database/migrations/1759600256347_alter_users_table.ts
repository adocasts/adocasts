import LessonPanels from '#enums/lesson_panels'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_enabled_transcript')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_enabled_transcript').notNullable().defaultTo(false)
    })

    this.defer(async (db) => {
      await db
        .from('users')
        .where('default_lesson_panel', LessonPanels.TRANSCRIPT)
        .update({ is_enabled_transcript: true })
    })
  }
}
