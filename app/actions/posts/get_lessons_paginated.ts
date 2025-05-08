import BaseAction from '#actions/base_action'
import LessonListDto from '../../dtos/lesson_list.js'
import Post from '#models/post'
import { postSearchValidator } from '#validators/post'
import router from '@adonisjs/core/services/router'
import { Infer } from '@vinejs/vine/types'

type Filters = Infer<typeof postSearchValidator> | undefined

export default class GetLessonsPaginated extends BaseAction<[Filters, string | undefined]> {
  async handle(
    { page = 1, perPage = 20, pattern, topic, sort }: Filters = {},
    routeIdentifier?: string
  ) {
    const paginator = await Post.build()
      .display()
      .search(pattern)
      .whereLesson()
      .whereHasTaxonomy(topic)
      .orderBySort(sort)
      .paginate(page, perPage)

    if (routeIdentifier) {
      const baseUrl = router.makeUrl(routeIdentifier)
      paginator.baseUrl(baseUrl)
    }

    paginator.queryString({ page, pattern, topic, sort })

    return LessonListDto.fromPaginator(paginator, { start: 1, end: paginator.lastPage })
  }
}
