import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'progresses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('users.id').notNullable()
      table.integer('post_id').unsigned().references('posts.id').nullable()
      table.integer('collection_id').unsigned().references('collections.id').nullable()
      table.integer('read_percent').unsigned()
      table.integer('watch_percent').unsigned()
      table.integer('watch_seconds').unsigned().notNullable().defaultTo(0)
      table.boolean('is_completed').notNullable().defaultTo(false)

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['id', 'user_id', 'post_id', 'collection_id'])
    })

    this.defer(async (db) => {
      const added: any[] = []
      const duplicates: any[] = []

      const progressions = await db
        .from('histories')
        .where('history_type_id', 2)
        .orderBy('updated_at', 'desc') // use latest first older will be the dups from player init bug

      console.log(`Adding ${progressions.length} progresses`)

      for (const progression of progressions) {
        if (!added.some(history => 
          progression.user_id === history.user_id && 
          progression.post_id === history.post_id && 
          progression.collection_id === history.collection_id
        )) {
          await db
            .table(this.tableName)
            .insert({
              id: progression.id, // keep the same id in case anyone is current watching a video
              user_id: progression.user_id,
              post_id: progression.post_id,
              collection_id: progression.collection_id,
              read_percent: progression.read_percent,
              watch_percent: progression.watch_percent,
              watch_seconds: progression.watch_seconds,
              is_completed: progression.is_completed,
              created_at: progression.created_at,
              updated_at: progression.updated_at,
            })

          added.push(progression)
        } else {
          duplicates.push(progression)
        }
      }
      
      console.log(`Added ${added.length} progresses, skipped ${duplicates.length} duplicates`)

      // update the id sequence to start at max history id found
      await db.knexRawQuery("SELECT SETVAL('progresses_id_seq', (SELECT MAX(id) FROM progresses), true)")

      console.log(`Updated id sequence`)

      console.log('Finished creating progresses table')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
