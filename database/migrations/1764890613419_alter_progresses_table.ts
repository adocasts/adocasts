import { BaseSchema } from '@adonisjs/lucid/schema'
import { DateTime } from 'luxon'

export default class extends BaseSchema {
  protected tableName = 'progresses'

  async up() {
    this.schema.alterTable(this.tableName, () => {})

    this.defer(async (db) => {
      const keep: any[] = []
      const duplicates: any[] = []

      const progresses = await db.from('progresses').orderBy('updated_at', 'desc')

      for (const progress of progresses) {
        const match = keep.find(
          (p) => progress.user_id === p.user_id && progress.post_id === p.post_id
        )

        if (!match) {
          progress.collection_id = null
          keep.push(progress)
          continue
        }

        if (progress.watch_seconds > match.watch_seconds) {
          match.watch_seconds = progress.watch_seconds
        }

        if (progress.read_percent > match.read_percent) {
          match.read_percent = progress.read_percent
        }

        if (progress.watch_percent > match.watch_percent) {
          match.watch_percent = progress.watch_percent
        }

        if (DateTime.fromSQL(progress.created_at) < DateTime.fromSQL(match.created_at)) {
          match.created_at = progress.created_at
        }

        if (DateTime.fromSQL(progress.updated_at) > DateTime.fromSQL(match.updated_at)) {
          match.updated_at = progress.updated_at
        }

        if (progress.is_completed) {
          match.is_completed = true
        }

        duplicates.push(progress)
      }

      console.log(`Merging ${duplicates.length} duplicate progresses`)

      for (const duplicate of duplicates) {
        await db.from(this.tableName).where('id', duplicate.id).delete()
      }

      for (const record of keep) {
        await db.from(this.tableName).where('id', record.id).update({
          collection_id: record.collection_id,
          watch_seconds: record.watch_seconds,
          read_percent: record.read_percent,
          watch_percent: record.watch_percent,
          is_completed: record.is_completed,
          created_at: record.created_at,
          updated_at: record.updated_at,
        })
      }

      console.log(`Merged ${duplicates.length} duplicate progresses`)

      console.log('Finished altering progresses table')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, () => {})
  }
}
