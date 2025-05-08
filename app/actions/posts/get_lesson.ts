import LessonShowDto from '../../dtos/lesson_show.js'
import Post from '#models/post'
import BaseAction from '#actions/base_action'

export default class GetLesson extends BaseAction<[string]> {
  async handle(slug: string) {
    const lesson = await GetLesson.fromDb(slug)

    // TODO: cache

    return lesson
  }

  static async fromDb(slug: string) {
    return Post.build()
      .displayShow()
      .whereLesson()
      .where({ slug })
      .withComments()
      .firstOrFail(LessonShowDto)
  }
}
