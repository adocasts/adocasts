import BaseAction from '#actions/base_action'
import Post from '#models/post'
import LessonShowDto from '../../dtos/lesson_show.js'

export default class GetSnippet extends BaseAction<[string]> {
  async handle(slug: string) {
    const snippet = await GetSnippet.fromDb(slug)

    // TODO: cache

    return snippet
  }

  static async fromDb(slug: string) {
    return Post.build()
      .displaySnippetShow()
      .where({ slug })
      .withComments()
      .firstOrFail(LessonShowDto)
  }
}
