import GetSeriesList, { DbOptions } from '#collection/actions/get_series_list'
import BaseSeriesDto from '#collection/dtos/base_series'
import CacheableAction from '#core/actions/cacheable_action'

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
    return GetSeriesList.run('db', options).orderLatestUpdated().dto(BaseSeriesDto)
  }
}
