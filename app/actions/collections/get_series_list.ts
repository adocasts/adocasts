import SeriesListDto from '#enums/series_list'
import Collection from '#models/collection'
import { seriesIndexValidator } from '#validators/series'
import Sorts from '#enums/sorts'
import NotImplementedException from '#exceptions/not_implemented_exception'
import LessonListDto from '../../dtos/lesson_list.js'
import TopicDto from '../../dtos/topic.js'
import { Infer } from '@vinejs/vine/types'
import _ from 'lodash'
import BaseAction from '#actions/base_action'

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

export default class GetSeriesList extends BaseAction<[CacheOptions]> {
  async handle(options?: CacheOptions) {
    let series = await GetSeriesList.fromDb().dto(SeriesListDto)

    // todo: cache

    if (options?.topic) {
      series = series.filter((s) => s.topics && s.topics.some((t) => t.slug === options.topic))
    }

    if (options?.difficulty) {
      series = series.filter((s) => s.difficultyId === options?.difficulty)
    }

    return this.#applySort(series, options?.sort)
  }

  static fromDb(options?: DbOptions) {
    return Collection.build()
      .series()
      .withPostCount()
      .withTotalMinutes()
      .withTaxonomies((query) => query.selectDto(TopicDto))
      .orderLatestUpdated()
      .if(options?.limit, (builder) => builder.limit(options!.limit!))
      .if(options?.excludeIds, (builder) => builder.exclude(options!.excludeIds!))
      .if(options?.withPosts, (builder) =>
        builder.withPostsFlat((query) => query.selectDto(LessonListDto), {
          limit: options?.postLimit,
        })
      )
  }

  #applySort(series: SeriesListDto[], sort: Validator['sort'] = Sorts.LATEST) {
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
