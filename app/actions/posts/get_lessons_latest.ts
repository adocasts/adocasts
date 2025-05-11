import LessonListDto from '../../dtos/lesson_list.js'
import Post from '#models/post'
import BaseAction from '#actions/base_action'

type Options = {
  limit?: number
}

export default class GetLessonsLatest extends BaseAction<[Options]> {
  async handle(options?: Options) {
    const lessons = await GetLessonsLatest.fromDb(options)

    // TODO: cache

    return lessons
  }

  static async fromDb({ limit = 12 }: Options = {}) {
    return Post.build().displayLesson().orderPublished().limit(limit).dto(LessonListDto)
  }
}
