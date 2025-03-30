import BaseSeriesDto from '../../dtos/series/base_series.js'
import cache from '@adonisjs/cache/services/main'
import GetSeries, { FromDbOptions } from './get_series.js'

interface Options {
  withPosts?: boolean
  excludeIds?: number[]
  limit?: number
  postLimit?: number
}

export default class GetSeriesRecentlyUpdated {
  static async fromCache(options?: Pick<Options, 'limit'>) {
    const results = await this.fromDb({
      limit: options?.limit,
      withPosts: true,
      postLimit: 5,
    })

    // TODO: cache

    return results
  }

  static async fromDb(options?: FromDbOptions) {
    return GetSeries.fromDb(options).orderLatestUpdated().dto(BaseSeriesDto)
  }
}
