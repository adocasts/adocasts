import CollectionBuilder from '#builders/collection_builder'
import BaseLessonDto from '../../dtos/lessons/base_lesson.js'
import BaseSeriesDto from '../../dtos/series/base_series.js'
import cache from '@adonisjs/cache/services/main'

interface Options {
  withPosts?: boolean
  excludeIds?: number[]
  limit?: number
  postLimit?: number
}

export default class GetSeriesRecentlyUpdated {
  static async fromCache(options?: Options) {
    const results = await this.fromDb(options)

    // TODO: cache

    return results
  }

  static async fromDb(options?: Options) {
    return CollectionBuilder.new()
      .series()
      .orderLatestUpdated()
      .withPostCount()
      .withTotalMinutes()
      .withTaxonomies({ withAsset: true, limit: 1 })
      .if(options?.limit, (builder) => builder.limit(options!.limit!))
      .if(options?.excludeIds, (builder) => builder.exclude(options!.excludeIds!))
      .if(options?.withPosts, (builder) =>
        builder.withPostsFlat((query) => query.selectDto(BaseLessonDto), {
          limit: options?.postLimit,
        })
      )
      .dto(BaseSeriesDto)
  }
}
