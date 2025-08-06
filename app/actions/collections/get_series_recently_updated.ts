import BaseAction from '#actions/base_action'
import SeriesListDto from '#dtos/series_list'
import CacheNamespaces from '#enums/cache_namespaces'
import cache from '@adonisjs/cache/services/main'
import GetSeriesList, { DbOptions } from './get_series_list.js'

interface CacheOptions {
  limit?: number
}

export default class GetSeriesRecentlyUpdated extends BaseAction<[CacheOptions]> {
  async handle(options?: CacheOptions) {
    return cache.namespace(CacheNamespaces.COLLECTIONS).getOrSet({
      key: `GET_SERIES_RECENTLY_UPDATED_${JSON.stringify(options)}`,
      factory: () =>
        GetSeriesRecentlyUpdated.fromDb({
          limit: options?.limit,
          withPosts: true,
          postLimit: 5,
        }),
    })
  }

  static async fromDb(options?: DbOptions) {
    return GetSeriesList.fromDb(options).dto(SeriesListDto)
  }
}
