import BaseAction from '#actions/base_action'
import Post from '#models/post'
import Watchlist from '#models/watchlist'
import LessonShowDto from '../../dtos/lesson_show.js'

export default class GetLesson extends BaseAction<[string]> {
  async handle(slug: string, userId?: number) {
    const lesson = await GetLesson.fromDb(slug)
    const isInWatchlist = await Watchlist.forPost(userId, lesson.id)

    lesson.meta.isInWatchlist = isInWatchlist

    // TODO: cache

    return lesson
  }

  static async fromDb(slug: string) {
    return Post.build()
      .displayLessonShow()
      .where({ slug })
      .withComments()
      .firstOrFail(LessonShowDto)
  }
}
