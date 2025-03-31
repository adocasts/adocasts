import Post from '#post/models/post'
import BaseLessonDto from '#post/dtos/base_lesson'

type Options = {
  limit?: number
}

export default class GetLessonsLatest {
  static async fromCache(options?: Options) {
    const lessons = await this.fromDb(options)

    // TODO: cache

    return lessons
  }

  static async fromDb({ limit = 12 }: Options = {}) {
    return Post.build().display().whereLesson().orderPublished().limit(limit).dto(BaseLessonDto)
  }
}
