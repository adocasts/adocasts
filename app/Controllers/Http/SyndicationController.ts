import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'
import Collection from 'App/Models/Collection'
import Taxonomy from 'App/Models/Taxonomy'
import { SitemapStream } from 'sitemap'
import { createGzip } from 'zlib'
import SyndicationService from 'App/Services/SyndicationService'
import Post from 'App/Models/Post'
import CacheService from 'App/Services/CacheService'
import CacheKeys from 'App/Enums/CacheKeys'

export default class SyndicationController {
  public async sitemap({ view }: HttpContextContract) {
    const series = await Collection.series()
      .preload('children')
      .wherePublic()
      .whereNull('parentId')
      .orderBy('name', 'asc')

    const topics = await Taxonomy.roots()
      .preload('children')
      .orderBy('name', 'asc')

    return view.render('sitemap', { series, topics })
  }

  public async xml({ response }: HttpContextContract) {
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

  public async feed({ response, view }: HttpContextContract) {   
    response.append('Content-Type', 'text/xml')

    return CacheService.try(CacheKeys.RSS_FEED, async () => {
      const content = await Post.query()
        .apply(s => s.forDisplay())
        .orderBy('publishAt', 'desc')
        .limit(25)
        .makeAllSharable()

      return view.render('rss/feed', {
        title: 'Adocasts - AdonisJS Screencasts & Lessons',
        description: 'Recent content from Adocasts - Learn AdonisJS, NodeJS, JavaScript and more through in-depth lessons, screencasts, and livestreams.',
        domain: Env.get('APP_DOMAIN'),
        feed: Env.get('APP_DOMAIN') + '/rss',
        content
      })
    }, CacheService.fiveMinutes)
  }
}
