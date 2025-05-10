import GetSeriesList, { DbOptions } from './get_series_list.js'
import SeriesListDto from '#dtos/series_list'
import BaseAction from '#actions/base_action'

interface CacheOptions {
  limit?: number
}

export default class GetSeriesRecentlyUpdated extends BaseAction<[CacheOptions]> {
  async handle(options?: CacheOptions) {
    const results = await GetSeriesRecentlyUpdated.fromDb({
      limit: options?.limit,
      withPosts: true,
      postLimit: 5,
    })

    // TODO: cache

    return results
  }

  static async fromDb(options?: DbOptions) {
    return GetSeriesList.fromDb(options).dto(SeriesListDto)
  }
}
