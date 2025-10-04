import LessonPanels from '#enums/lesson_panels'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('default_lesson_panel').unsigned().notNullable().defaultTo(LessonPanels.SERIES)
    })

    this.defer(async (db) => {
      // keep preference set to show transcript by default
      await db
        .from('users')
        .where('is_enabled_transcript', 'true')
        .update({ default_lesson_panel: LessonPanels.TRANSCRIPT })
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('default_lesson_panel')
    })
  }
}
