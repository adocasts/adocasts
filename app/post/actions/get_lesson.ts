import CacheableAction from '#core/actions/cacheable_action'
import LessonShowDto from '#post/dtos/lesson_show'
import Post from '#post/models/post'

export default class GetLesson extends CacheableAction<string, string> {
  async fromCache(slug: string) {
    const lesson = await this.fromDb(slug)

    // TODO: cache

    return lesson
  }

  async fromDb(slug: string) {
    return Post.build()
      .displayShow()
      .whereLesson()
      .where({ slug })
      .withComments()
      .firstOrFail(LessonShowDto)
  }
}
