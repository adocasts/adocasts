import BaseSeriesDto from '#collection/dtos/base_series'
import CacheableAction from '#core/actions/cacheable_action'
import GetSeries, { DbOptions } from './get_series.js'

interface CacheOptions {
  limit?: number
}

export default class GetSeriesRecentlyUpdated extends CacheableAction<CacheOptions, DbOptions> {
  async fromCache(options?: CacheOptions) {
    const results = await this.fromDb({
      limit: options?.limit,
      withPosts: true,
      postLimit: 5,
    })

    // TODO: cache

    return results
  }

  async fromDb(options?: DbOptions) {
    return GetSeries.run('db', options).orderLatestUpdated().dto(BaseSeriesDto)
  }
}
