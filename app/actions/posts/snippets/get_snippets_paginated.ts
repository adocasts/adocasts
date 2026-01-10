import BaseAction from '#actions/base_action'
import BlogListDto from '#dtos/blog_list'
import TopicDto from '#dtos/topic'
import Post from '#models/post'
import { postSearchValidator } from '#validators/post'
import router from '@adonisjs/core/services/router'
import { Infer } from '@vinejs/vine/types'

type Filters = Infer<typeof postSearchValidator> | undefined

export default class GetSnippetsPaginated extends BaseAction {
  async handle(
    { page = 1, perPage = 20, ...filters }: Filters = {},
    routeIdentifier: string = '',
    routeParams: Record<string, any> = {}
  ) {
    const paginator = await Post.build()
      .displaySnippet()
      .search(filters.pattern)
      .withTaxonomies((q) => q.selectDto(TopicDto))
      .whereHasTaxonomy(filters.topics)
      .orderBySort(filters.sort)
      .paginate(page, perPage)

    if (routeIdentifier) {
      const baseUrl = router.makeUrl(routeIdentifier, routeParams)
      paginator.baseUrl(baseUrl)
    }

    paginator.queryString(filters)

    return BlogListDto.fromPaginator(paginator, { start: 1, end: paginator.lastPage })
  }
}
