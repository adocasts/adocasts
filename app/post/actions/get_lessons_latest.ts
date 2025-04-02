import CacheableAction from '#core/actions/cacheable_action'
import BaseLessonDto from '#post/dtos/base_lesson'
import Post from '#post/models/post'

type Options = {
  limit?: number
}

export default class GetLessonsLatest extends CacheableAction<Options, Options> {
  async fromCache(options?: Options) {
    const lessons = await this.fromDb(options)

    // TODO: cache

    return lessons
  }

  async fromDb({ limit = 12 }: Options = {}) {
    return Post.build().display().whereLesson().orderPublished().limit(limit).dto(BaseLessonDto)
  }
}
