import CacheKeys from '#enums/cache_keys'
import Post from '#models/post'
import CacheService from '#services/cache_service'
import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import HtmlParser from '#services/html_parser';
import Collection from '#models/collection'
import Taxonomy from '#models/taxonomy'
import States from '#enums/states'
import SyndicationService from '#services/syndication_service'
import { SitemapStream } from 'sitemap'
import { createGzip } from 'zlib'

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

  public async sitemap({ view }: HttpContext) {
    const series = await Collection.series()
      .preload('children')
      .where('stateId', States.PUBLIC)
      .whereNull('parentId')
      .orderBy('name', 'asc')

    const topics = await Taxonomy.roots()
      .preload('children')
      .orderBy('name', 'asc')

    return view.render('pages/sitemap', { series, topics })
  }

  public async xml({ response }: HttpContext) {
    let urls = await SyndicationService.getCachedSitemapUrls()

    response.header('Content-Type', 'application/xml')
    response.header('Content-Encoding', 'gzip')

    try {
      const sitemapStream = new SitemapStream({ hostname: 'https://adocasts.com' })
      const pipeline = sitemapStream.pipe(createGzip())

      if (!urls) {
        urls = await SyndicationService.getSitemapUrls()
        await SyndicationService.setCacheSitemapUrls(urls)
      }

      urls.map(url => sitemapStream.write(url))

      sitemapStream.end()

      response.stream(pipeline)
    } catch (e) {
      console.error(e)
      response.status(500)
    }
  }
}