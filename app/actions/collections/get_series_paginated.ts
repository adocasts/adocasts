import BaseAction from '#actions/base_action'
import LessonListDto from '../../dtos/lesson_list.js'
import router from '@adonisjs/core/services/router'
import { Infer } from '@vinejs/vine/types'
import GetSeriesList, { DbOptions } from './get_series_list.js'
import Collection from '#models/collection'
import TopicDto from '#dtos/topic'
import { seriesPaginatorValidator } from '#validators/series'
import SeriesListDto from '#dtos/series_list'

type Filters = Infer<typeof seriesPaginatorValidator>

export default class GetSeriesPaginated extends BaseAction<[Filters, string | undefined]> {
  async handle(
    { page = 1, perPage = 20, difficulty, topic, sort }: Filters = {},
    routeIdentifier?: string
  ) {
    const paginator = await GetSeriesList.fromDb({ topic })
      .selectDto(SeriesListDto)
      .paginate(page, perPage)

    if (routeIdentifier) {
      const baseUrl = router.makeUrl(routeIdentifier)
      paginator.baseUrl(baseUrl)
    }

    paginator.queryString({ page, difficulty, topic, sort })

    return SeriesListDto.fromPaginator(paginator, { start: 1, end: paginator.lastPage })
  }

  static fromDb(options?: DbOptions) {
    return Collection.build()
      .series()
      .withPostCount()
      .withTotalMinutes()
      .withTaxonomies((query) => query.selectDto(TopicDto))
      .orderLatestUpdated()
      .if(options?.topic, (builder) => builder.whereHasTaxonomy(options!.topic!))
      .if(options?.limit, (builder) => builder.limit(options!.limit!))
      .if(options?.excludeIds, (builder) => builder.exclude(options!.excludeIds!))
      .if(options?.withPosts, (builder) =>
        builder.withPostsFlat((query) => query.selectDto(LessonListDto), {
          limit: options?.postLimit,
        })
      )
  }
}
