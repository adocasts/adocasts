import Collection from '#models/collection'
import { Infer } from '@vinejs/vine/types'
import BaseLessonDto from '../../dtos/lessons/base_lesson.js'
import { seriesIndexValidator } from '#validators/series'
import BaseSeriesDto from '../../dtos/series/base_series.js'
import _ from 'lodash'
import NotImplementedException from '#exceptions/not_implemented_exception'

type Validator = Infer<typeof seriesIndexValidator>

interface FromCacheOptions {
  sort?: Validator['sort']
  topic?: Validator['topic']
}

export interface FromDbOptions {
  withPosts?: boolean
  excludeIds?: number[]
  limit?: number
  postLimit?: number
}

export default class GetSeries {
  static async fromCache(options?: FromCacheOptions) {
    let series = await this.fromDb().dto(BaseSeriesDto)

    // todo: cache

    if (options?.topic) {
      series = series.filter((s) => s.topics && s.topics.some((t) => t.slug === options.topic))
    }

    return this.#applySort(series, options?.sort)
  }

  static fromDb(options?: FromDbOptions) {
    return Collection.build()
      .series()
      .withPostCount()
      .withTotalMinutes()
      .withTaxonomies({ withAsset: true })
      .if(options?.limit, (builder) => builder.limit(options!.limit!))
      .if(options?.excludeIds, (builder) => builder.exclude(options!.excludeIds!))
      .if(options?.withPosts, (builder) =>
        builder.withPostsFlat((query) => query.selectDto(BaseLessonDto), {
          limit: options?.postLimit,
        })
      )
  }

  static #applySort(series: BaseSeriesDto[], sort?: Validator['sort']) {
    switch (sort) {
      case 'latest':
        return _.orderBy(series, (item) => item.lessons?.at(0)?.publishAt, ['desc'])
      case 'longest':
        return _.orderBy(series, (item) => Number(item.meta.video_seconds_sum), ['desc'])
      case 'shortest':
        return _.orderBy(series, (item) => Number(item.meta.video_seconds_sum), ['asc'])
      case 'popular':
        throw new NotImplementedException('GetSeries.#applySort: popular has not been implemented')
      default:
        return _.orderBy(series, (item) => item.name, ['asc'])
    }
  }
}
