import CollectionBuilder from '#builders/collection_builder'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import BaseLessonDto from '../../dtos/lessons/base_lesson.js'
import BaseSeriesDto from '../../dtos/series/base_series.js'

interface Options {
  withPosts?: boolean
  excludeIds?: number[]
  limit?: number
  postLimit?: number
}

@inject()
export default class GetSeriesRecentlyUpdated {
  constructor(protected ctx: HttpContext) {}

  async handle(options: Options) {
    const series = await GetSeriesRecentlyUpdated.handle(options)

    // todo cache impl

    return series
  }

  static async handle({ withPosts, excludeIds, limit, postLimit }: Options) {
    return CollectionBuilder.new()
      .series()
      .orderLatestUpdated()
      .select(BaseSeriesDto.getSelectable())
      .if(limit, (builder) => builder.limit(limit!))
      .if(excludeIds, (builder) => builder.exclude(excludeIds!))
      .if(withPosts, (builder) =>
        builder.withPostsFlat((query) => query.select(BaseLessonDto.getSelectable()), {
          limit: postLimit,
        })
      )
      .dto(BaseSeriesDto)
  }
}
