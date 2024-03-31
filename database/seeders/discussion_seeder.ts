import { DiscussionFactory } from '#factories/discussion_factory'
import app from '@adonisjs/core/services/app'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    if (app.inTest || app.inProduction) {
      return
    }

    // Write your database queries inside the run method
    await DiscussionFactory
      .with('user', 1, builder => builder.with('profile'))
      .with('comments', 4, builder => builder.with('user', 1, builder => builder.with('profile')))
      .createMany(100)
  }
}
