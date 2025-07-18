import BaseAction from '#actions/base_action'
import { DisplayOptions } from '#builders/post_builder'
import Post from '#models/post'
import Watchlist from '#models/watchlist'
import LessonShowDto from '../../dtos/lesson_show.js'

export default class GetLesson extends BaseAction<[string]> {
  async handle(slug: string, userId?: number, options?: DisplayOptions) {
    const lesson = await GetLesson.fromDb(slug, options)
    const isInWatchlist = await Watchlist.forPost(userId, lesson.id)

    lesson.meta.isInWatchlist = isInWatchlist

    // TODO: cache

    return lesson
  }

  static async fromDb(slug: string, options?: DisplayOptions) {
    return Post.build()
      .displayLessonShow(options)
      .where({ slug })
      .withComments()
      .firstOrFail(LessonShowDto)
  }
}
