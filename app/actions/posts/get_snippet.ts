import BaseAction from '#actions/base_action'
import CacheNamespaces from '#enums/cache_namespaces'
import Post from '#models/post'
import Watchlist from '#models/watchlist'
import cache from '@adonisjs/cache/services/main'
import LessonShowDto from '../../dtos/lesson_show.js'

export default class GetSnippet extends BaseAction<[string]> {
  async handle(slug: string, userId?: number) {
    const snippet = await cache.namespace(CacheNamespaces.POSTS).getOrSet({
      key: `GET_SNIPPET_${slug}`,
      factory: () => GetSnippet.fromDb(slug),
    })

    const isInWatchlist = await Watchlist.forPost(userId, snippet.id)

    snippet.meta.isInWatchlist = isInWatchlist

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
