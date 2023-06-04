import Env from '@ioc:Adonis/Core/Env'
import axios from 'axios'
import { DateTime } from 'luxon'
import CacheService from './CacheService'

export default class AnalyticsService {
  private static breakdownEndpoint = 'https://analytics.adocasts.com/api/v1/stats/breakdown?site_id=adocasts.com'
  private static aggregateEndpoint = 'https://analytics.adocasts.com/api/v1/stats/aggregate?site_id=adocasts.com'
  private static defaultStartDte = DateTime.now().set({ year: 2000, month: 1, day: 1 })

  /**
   * Gets most popular content slugs for the past 30 days
   * @param limit 
   * @returns 
   */
  public static async getPastMonthsPopularContentSlugs(limit = 8) {
    return await CacheService.try('ANALYTICS_PAST_MONTH_POPULAR_CONTENT', async () => {
      const contentPathPrefix = ['/lessons/', '/news/', '/streams/', '/posts/']
      const results = await this.getPast30dViews()
      return results.reduce((list, result) => {
        const prefix = contentPathPrefix.find(prefix => result.page.startsWith(prefix))
        if (list.length < limit && prefix) {
          list.push(result.page.replace(prefix, '').replaceAll('/', ''))
        }
        return list
      }, [])
    }, CacheService.oneDay, true)
  }

  /**
   * Gets a path's recorded page views during specified time period
   * @param path 
   * @param startDte 
   * @param endDte 
   * @returns 
   */
  public static async getPageViews(path: string, startDte: DateTime = this.defaultStartDte, endDte = DateTime.now()) {
    const start = startDte.toFormat('yyyy-MM-dd')
    const end = endDte.toFormat('yyyy-MM-dd')
    const { data } = await this.apiGet(`${this.aggregateEndpoint}&metrics=pageviews&period=custom&date=${start},${end}&filters=event:page%3D%3D${path}`)
    return data.results.pageviews.value
  }

  /**
   * Gets page views for the past 30 days
   * @returns 
   */
  public static async getPast30dViews() {
    const { data } = await this.apiGet(`${this.breakdownEndpoint}&period=30d&property=event:page`)
    return data.results
  }

  /**
   * API helper to get data from analytics.adocasts.com
   * @param endpoint 
   * @returns 
   */
  private static async apiGet(endpoint: string) {
    return axios.get(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Env.get('PLAUSIBLE_API_KEY')}`
      }
    })
  }
}