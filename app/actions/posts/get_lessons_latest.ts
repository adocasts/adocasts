import BaseAction from '#actions/base_action'
import CacheNamespaces from '#enums/cache_namespaces'
import Post from '#models/post'
import cache from '@adonisjs/cache/services/main'
import LessonListDto from '../../dtos/lesson_list.js'

type Options = {
  limit?: number
}

export default class GetLessonsLatest extends BaseAction<[Options]> {
  async handle(options?: Options) {
    return cache.namespace(CacheNamespaces.POSTS).getOrSet({
      key: `GET_LESSONS_LATEST_${JSON.stringify(options)}`,
      factory: () => GetLessonsLatest.fromDb(options),
    })
  }

  static async fromDb({ limit = 15 }: Options = {}) {
    return Post.build().displayLesson().orderPublished().limit(limit).dto(LessonListDto)
  }
}
