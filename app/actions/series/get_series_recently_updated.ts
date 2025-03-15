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
  static async fromCache(options: Options) {
    const results = await this.fromDb(options)

    // TODO: cache

    return results
  }

  static async fromDb({ withPosts, excludeIds, limit, postLimit }: Options) {
    return CollectionBuilder.new()
      .series()
      .orderLatestUpdated()
      .withPostCount()
      .withTotalMinutes()
      .withTaxonomies({ withAsset: true, limit: 1 })
      .if(limit, (builder) => builder.limit(limit!))
      .if(excludeIds, (builder) => builder.exclude(excludeIds!))
      .if(withPosts, (builder) =>
        builder.withPostsFlat((query) => query.selectDto(BaseLessonDto), { limit: postLimit })
      )
      .dto(BaseSeriesDto)
  }
}
