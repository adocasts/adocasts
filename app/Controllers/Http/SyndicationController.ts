import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Collection from 'App/Models/Collection'
import Taxonomy from 'App/Models/Taxonomy'
import { SitemapStream } from 'sitemap'
import { createGzip } from 'zlib'
import SyndicationService from 'App/Services/SyndicationService'

export default class SyndicationController {
  public async sitemap({ view }: HttpContextContract) {
    const series = await Collection.series()
      .preload('children')
      .wherePublic()
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
}
