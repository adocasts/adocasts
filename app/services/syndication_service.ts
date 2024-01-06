import CacheService from './cache_service.js'
import Collection from '#models/collection'
import Taxonomy from '#models/taxonomy'
import Post from '#models/post'
import router from '@adonisjs/core/services/router'
import States from '#enums/states'

export type Frequency = 'daily' | 'weekly' | 'monthly'

export interface SiteMapItem {
  url: string
  changefreq: Frequency
  priority: number
}

export default class SyndicationService {
  static sitemapCacheKey: string = 'sitemap'

  static async getCachedSitemapUrls(): Promise<SiteMapItem[] | undefined> {
    const urlString = await CacheService.get(this.sitemapCacheKey)
    return urlString && (JSON.parse(urlString) as SiteMapItem[])
  }

  static async setCacheSitemapUrls(urls: SiteMapItem[]) {
    return CacheService.set(this.sitemapCacheKey, JSON.stringify(urls), 86400)
  }

  static async getSitemapUrls(): Promise<SiteMapItem[]> {
    // series
    const series = await Collection.series()
      .whereNull('parentId')
      .where('stateId', States.PUBLIC)
      .orderBy('name', 'asc')
      .select('slug')

    // topics
    const rootTopics = await Taxonomy.roots().orderBy('name', 'asc').select('slug')
    const childTopics = await Taxonomy.children().orderBy('name', 'asc').select('slug')

    // posts
    const lessons = await Post.lessons()
      .apply((scope) => scope.published())
      .orderBy('title', 'asc')
      .select('slug')
    const blogs = await Post.blogs()
      .apply((scope) => scope.published())
      .orderBy('title', 'asc')
      .select('slug')
    const news = await Post.news()
      .apply((scope) => scope.published())
      .orderBy('title', 'asc')
      .select('slug')
    const streams = await Post.livestreams()
      .apply((scope) => scope.published())
      .orderBy('title', 'asc')
      .select('slug')

    let urls: SiteMapItem[] = [
      this.make('/', 'weekly', 1.0),
      this.make('/series', 'weekly', 0.8),
      this.make('/topics', 'weekly', 0.8),
      this.make('/lessons', 'weekly', 0.8),
      this.make('/blog', 'weekly', 0.3),
      this.make('/streams', 'weekly', 0.3),
      this.make('/posts', 'weekly', 0.3),
    ]

    series.map(
      ({ slug }) => (urls = this.add(urls, this.map('series.show', { slug }, 'weekly', 0.7)))
    )
    rootTopics.map(
      ({ slug }) => (urls = this.add(urls, this.map('topics.show', { slug }, 'weekly', 0.7)))
    )
    childTopics.map(
      ({ slug }) => (urls = this.add(urls, this.map('topics.show', { slug }, 'weekly', 0.5)))
    )
    lessons.map(
      ({ slug }) => (urls = this.add(urls, this.map('lessons.show', { slug }, 'weekly', 0.6)))
    )
    news.map(({ slug }) => (urls = this.add(urls, this.map('news.show', { slug }, 'weekly', 0.3))))
    streams.map(
      ({ slug }) => (urls = this.add(urls, this.map('streams.show', { slug }, 'weekly', 0.3)))
    )
    blogs.map(({ slug }) => (urls = this.add(urls, this.map('blog.show', { slug }, 'weekly', 0.2))))

    return urls
  }

  private static make(url: string, changefreq: Frequency, priority: number = 0.5): SiteMapItem {
    return { url, changefreq, priority }
  }

  private static map(
    routeName: string,
    params: { [x: string]: any },
    changefreq: Frequency = 'weekly',
    priority: number = 0.5
  ): SiteMapItem | undefined {
    const url = router.makeUrl(routeName, { params })
    if (!url) return
    return this.make(url, changefreq, priority)
  }

  private static add(urls: SiteMapItem[], conditionalAdd: SiteMapItem | undefined) {
    if (!conditionalAdd) return urls
    return [...urls, conditionalAdd]
  }
}
