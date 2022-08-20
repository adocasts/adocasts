import CacheService from 'App/Services/CacheService'
import Collection from 'App/Models/Collection'
import Taxonomy from 'App/Models/Taxonomy'
import Post from 'App/Models/Post'
import Route from '@ioc:Adonis/Core/Route'

export default class SyndicationService {
  public static sitemapCacheKey: string = 'sitemap'

  public static async getCachedSitemapUrls() {
    const urlString = await CacheService.get(this.sitemapCacheKey)
    return urlString && JSON.parse(urlString)
  }

  public static async setCacheSitemapUrls(urls: SiteMapItem[]) {
    return CacheService.set(this.sitemapCacheKey, JSON.stringify(urls), 86400)
  }

  public static async getSitemapUrls(): Promise<SiteMapItem[]> {
    // series
    const series = await Collection.series()
      .whereNull('parentId')
      .wherePublic()
      .orderBy('name', 'asc')
      .selectColumn('slug')

    // topics
    const rootTopics = await Taxonomy.roots().orderBy('name', 'asc').selectColumn('slug')
    const childTopics = await Taxonomy.children().orderBy('name', 'asc').selectColumn('slug')

    // posts
    const lessons = await Post.lessons().apply(scope => scope.published()).orderBy('title', 'asc').selectColumn('slug')
    const blogs = await Post.blogs().apply(scope => scope.published()).orderBy('title', 'asc').selectColumn('slug')
    const news = await Post.news().apply(scope => scope.published()).orderBy('title', 'asc').selectColumn('slug')
    const streams = await Post.livestreams().apply(scope => scope.published()).orderBy('title', 'asc').selectColumn('slug')

    let urls: SiteMapItem[] = [
      this.make('/', 'weekly', 1.0),
      this.make('/series', 'weekly', 0.8),
      this.make('/topics', 'weekly', 0.8),
      this.make('/lessons', 'weekly', 0.8),
      this.make('/news', 'weekly', 0.3),
      this.make('/streams', 'weekly', 0.3),
      this.make('/posts', 'weekly', 0.3),
    ]

    series.map(slug => urls = this.add(urls, this.map('series.show', { slug }, 'weekly', 0.7)))
    rootTopics.map(slug => urls = this.add(urls, this.map('topics.show', { slug }, 'weekly', 0.7)))
    childTopics.map(slug => urls = this.add(urls, this.map('topics.show', { slug }, 'weekly', 0.5)))
    lessons.map(slug => urls = this.add(urls, this.map('lessons.show', { slug }, 'weekly', 0.6)))
    news.map(slug => urls = this.add(urls, this.map('news.show', { slug }, 'weekly', 0.3)))
    streams.map(slug => urls = this.add(urls, this.map('livestreams.show', { slug }, 'weekly', 0.3)))
    blogs.map(slug => urls = this.add(urls, this.map('posts.show', { slug }, 'weekly', 0.2)))

    return urls
  }

  private static make(url: string, changefreq: Frequency, priority: number = 0.5): SiteMapItem {
    return { url, changefreq, priority }
  }

  private static map(routeName: string, params: { [x: string]: any }, changefreq: Frequency = 'weekly', priority: number = 0.5): SiteMapItem | undefined {
    const url = Route.makeUrl(routeName, { params })
    if (!url) return
    return this.make(url, changefreq, priority)
  }

  private static add(urls: SiteMapItem[], conditionalAdd: SiteMapItem | undefined) {
    if (!conditionalAdd) return urls
    return [...urls, conditionalAdd]
  }
}
