import Env from '@ioc:Adonis/Core/Env'
import axios from 'axios'
import CacheService from './CacheService'

export default class AnalyticsService {
  private static apiEndpoint = 'https://analytics.adocasts.com/api/v1/stats/breakdown?site_id=adocasts.com'

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

  public static async getPast30dViews() {
    const { data } = await this.apiGet(`${this.apiEndpoint}&period=30d&property=event:page`)
    return data.results
  }

  public static async apiGet(endpoint: string) {
    return axios.get(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Env.get('PLAUSIBLE_API_KEY')}`
      }
    })
  }
}