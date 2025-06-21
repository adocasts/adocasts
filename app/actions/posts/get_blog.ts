import BaseAction from '#actions/base_action'
import Post from '#models/post'
import Watchlist from '#models/watchlist'
import LessonShowDto from '../../dtos/lesson_show.js'

export default class GetBlog extends BaseAction<[string]> {
  async handle(slug: string, userId?: number) {
    const blog = await GetBlog.fromDb(slug)
    const isInWatchlist = await Watchlist.forPost(userId, blog.id)

    blog.meta.isInWatchlist = isInWatchlist

    // TODO: cache

    return blog
  }

  static async fromDb(slug: string) {
    return Post.build().displayBlogShow().where({ slug }).withComments().firstOrFail(LessonShowDto)
  }
}
