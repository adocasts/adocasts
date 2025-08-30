import BaseAction from '#actions/base_action'
import SeriesListDto from '#dtos/series_list'
import TopicDto from '#dtos/topic'
import Sorts from '#enums/sorts'
import Collection from '#models/collection'
import { seriesPaginatorValidator } from '#validators/series'
import router from '@adonisjs/core/services/router'
import { Infer } from '@vinejs/vine/types'

type Filters = Infer<typeof seriesPaginatorValidator>

export default class GetSeriesPaginated extends BaseAction {
  async handle(
    { page = 1, perPage = 20, ...filters }: Filters = {},
    routeIdentifier: string = '',
    routeParams: Record<string, any> = {}
  ) {
    const paginator = await GetSeriesPaginated.fromDb(filters)
      .selectDto(SeriesListDto)
      .paginate(page, perPage)

    if (routeIdentifier) {
      const baseUrl = router.makeUrl(routeIdentifier, routeParams)
      paginator.baseUrl(baseUrl)
    }

    paginator.queryString(filters)

    return SeriesListDto.fromPaginator(paginator, { start: 1, end: paginator.lastPage })
  }

  static fromDb(options?: Filters) {
    return Collection.build()
      .series()
      .search(options?.pattern)
      .whereHasPosts()
      .whereHasTaxonomy(options?.topics)
      .if(options?.difficulties, (query) =>
        query.whereIn('difficultyId', options?.difficulties as number[])
      )
      .withPostCount()
      .withTotalMinutes()
      .withTaxonomies((builder) => builder.selectDto(TopicDto))
      .if(
        options?.sort === Sorts.ALPHA,
        (builder) => builder.orderBy('name'),
        (builder) => builder.orderLatestUpdated()
      )
  }
}
