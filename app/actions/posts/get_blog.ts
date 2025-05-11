import LessonShowDto from '../../dtos/lesson_show.js'
import Post from '#models/post'
import BaseAction from '#actions/base_action'

export default class GetBlog extends BaseAction<[string]> {
  async handle(slug: string) {
    const blog = await GetBlog.fromDb(slug)

    // TODO: cache

    return blog
  }

  static async fromDb(slug: string) {
    return Post.build().displayBlogShow().where({ slug }).withComments().firstOrFail(LessonShowDto)
  }
}
