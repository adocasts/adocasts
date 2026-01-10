import { DiscussionFactory } from '#database/factories/discussion_factory'
import app from '@adonisjs/core/services/app'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    if (app.inTest || app.inProduction) {
      return
    }

    await DiscussionFactory.with('user', 1, (builder) => builder.with('profile'))
      .with('comments', 4, (comment) => comment.with('user', 1, (user) => user.with('profile')))
      .createMany(100)
  }
}
