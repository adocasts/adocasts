import { DiscussionFactory } from '#factories/discussion_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await DiscussionFactory
      .with('user', 1, builder => builder.with('profile'))
      .with('comments', 4, builder => builder.with('user', 1, builder => builder.with('profile')))
      .createMany(100)
  }
}