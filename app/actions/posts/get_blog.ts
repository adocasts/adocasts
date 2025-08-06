import BaseAction from '#actions/base_action'
import CacheNamespaces from '#enums/cache_namespaces'
import Post from '#models/post'
import Watchlist from '#models/watchlist'
import cache from '@adonisjs/cache/services/main'
import LessonShowDto from '../../dtos/lesson_show.js'

export default class GetBlog extends BaseAction<[string]> {
  async handle(slug: string, userId?: number) {
    const blog = await cache.namespace(CacheNamespaces.POSTS).getOrSet({
      key: `GET_BLOG_${slug}`,
      factory: () => GetBlog.fromDb(slug),
    })

    const isInWatchlist = await Watchlist.forPost(userId, blog.id)

    blog.meta.isInWatchlist = isInWatchlist

    return blog
  }

  static async fromDb(slug: string) {
    return Post.build().displayBlogShow().where({ slug }).withComments().firstOrFail(LessonShowDto)
  }
}
