import BaseAction from '#actions/base_action'
import Post from '#models/post'
import { postSearchValidator } from '#validators/post'
import router from '@adonisjs/core/services/router'
import { Infer } from '@vinejs/vine/types'
import LessonListDto from '../../dtos/lesson_list.js'

type Filters = Infer<typeof postSearchValidator> | undefined

export default class GetLessonsPaginated extends BaseAction {
  async handle(
    { page = 1, perPage = 20, ...filters }: Filters = {},
    routeIdentifier: string = '',
    routeParams: Record<string, any> = {}
  ) {
    const paginator = await Post.build()
      .displayLesson()
      .search(filters.pattern)
      .whereHasTaxonomy(filters.topics)
      .orderBySort(filters.sort)
      .paginate(page, perPage)

    if (routeIdentifier) {
      const baseUrl = router.makeUrl(routeIdentifier, routeParams)
      paginator.baseUrl(baseUrl)
    }

    paginator.queryString(filters)

    return LessonListDto.fromPaginator(paginator, { start: 1, end: paginator.lastPage })
  }
}
