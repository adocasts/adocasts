import BaseAction from '#actions/base_action'
import GetComments from '#actions/comments/get_comments'
import { DisplayOptions } from '#builders/post_builder'
import CacheNamespaces from '#enums/cache_namespaces'
import Post from '#models/post'
import Watchlist from '#models/watchlist'
import cache from '@adonisjs/cache/services/main'
import LessonShowDto from '../../dtos/lesson_show.js'

export default class GetLesson extends BaseAction {
  async handle(slug: string, userId?: number, options?: DisplayOptions) {
    const lesson = await cache.namespace(CacheNamespaces.POSTS).getOrSet({
      key: `GET_LESSON_${slug}_${JSON.stringify(options ?? {})}`,
      factory: () => GetLesson.fromDb(slug, options),
    })

    const comments = await GetComments.run(lesson.id, 'post')
    const isInWatchlist = await Watchlist.forPost(userId, lesson.id)

    lesson.comments = comments.list
    lesson.meta.commentsCount = comments.count
    lesson.meta.isInWatchlist = isInWatchlist

    return lesson
  }

  static async fromDb(slug: string, options?: DisplayOptions) {
    return Post.build().displayLessonShow(options).where({ slug }).firstOrFail(LessonShowDto)
  }
}
