import CacheKeys from '#enums/cache_keys'
import Post from '#models/post'
import CacheService from '#services/cache_service'
import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import HtmlParser from '#services/html_parser';

export default class SyndicationsController {
  public async rss({ view, response }: HttpContext) {
    response.append('Content-Type', 'text/xml')

    return CacheService.try(CacheKeys.RSS_FEED, async () => {
      const content = await Post.query()
        .apply(s => s.forDisplay())
        .apply(s => s.publishedPublic())
        .orderBy('publishAt', 'desc')
        .limit(25)

      for (const post of content) {
        post.body = post.body && await HtmlParser.normalizeUrls(post.body)
      }

      return view.render('rss/feed', {
        title: 'Adocasts - AdonisJS Screencasts & Lessons',
        description: 'Recent content from Adocasts - Learn AdonisJS, NodeJS, JavaScript and more through in-depth lessons, screencasts, and livestreams.',
        domain: env.get('APP_DOMAIN'),
        feed: env.get('APP_DOMAIN') + '/rss',
        content
      })
    }, CacheService.fiveMinutes)
  }
}