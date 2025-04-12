import BaseSeriesDto from '#collection/dtos/base_series'
import Collection from '#collection/models/collection'
import { seriesIndexValidator } from '#collection/validators/series'
import CacheableAction from '#core/actions/cacheable_action'
import Sorts from '#core/enums/sorts'
import NotImplementedException from '#core/exceptions/not_implemented_exception'
import BaseLessonDto from '#post/dtos/base_lesson'
import BaseTopicDto from '#taxonomy/dtos/base_topic'
import { Infer } from '@vinejs/vine/types'
import _ from 'lodash'

type Validator = Infer<typeof seriesIndexValidator>

interface CacheOptions {
  sort?: Validator['sort']
  topic?: Validator['topic']
  difficulty?: Validator['difficulty']
}

export interface DbOptions {
  withPosts?: boolean
  excludeIds?: number[]
  limit?: number
  postLimit?: number
}

export default class GetSeriesList extends CacheableAction<CacheOptions, DbOptions> {
  async fromCache(options?: CacheOptions) {
    let series = await this.fromDb().dto(BaseSeriesDto)

    // todo: cache

    if (options?.topic) {
      series = series.filter((s) => s.topics && s.topics.some((t) => t.slug === options.topic))
    }

    if (options?.difficulty) {
      series = series.filter((s) => s.difficultyId === options?.difficulty)
    }

    return this.#applySort(series, options?.sort)
  }

  fromDb(options?: DbOptions) {
    return Collection.build()
      .series()
      .withPostCount()
      .withTotalMinutes()
      .withTaxonomies((query) => query.selectDto(BaseTopicDto))
      .orderLatestUpdated()
      .if(options?.limit, (builder) => builder.limit(options!.limit!))
      .if(options?.excludeIds, (builder) => builder.exclude(options!.excludeIds!))
      .if(options?.withPosts, (builder) =>
        builder.withPostsFlat((query) => query.selectDto(BaseLessonDto), {
          limit: options?.postLimit,
        })
      )
  }

  #applySort(series: BaseSeriesDto[], sort: Validator['sort'] = Sorts.LATEST) {
    switch (sort) {
      case Sorts.ALPHA:
        return _.orderBy(series, (item) => item.name, ['asc'])
      case Sorts.LONGEST:
        return _.orderBy(series, (item) => Number(item.meta.video_seconds_sum), ['desc'])
      case Sorts.SHORTEST:
        return _.orderBy(series, (item) => Number(item.meta.video_seconds_sum), ['asc'])
      case Sorts.POPULAR:
        throw new NotImplementedException('GetSeries.#applySort: popular has not been implemented')
      default:
        return series // default is latest
    }
  }
}
