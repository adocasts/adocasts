import BaseAction from '#actions/base_action'
import Discussion from '#models/discussion'
import { discussionSearchValidator } from '#validators/discussion'
import router from '@adonisjs/core/services/router'
import { Infer } from '@vinejs/vine/types'
import DiscussionListDto from '../../dtos/discussion_list.js'

type Filters = Infer<typeof discussionSearchValidator> | undefined

export default class GetDiscussionsPaginated extends BaseAction<[Filters, string | undefined]> {
  public async handle(
    { page = 1, perPage = 20, ...filters }: Filters = {},
    routeIdentifier: string = '',
    routeParams: Record<string, any> = {}
  ) {
    const paginator = await Discussion.build()
      .search(filters.pattern)
      .whereFeed(filters.feed)
      .whereHasTaxonomy(filters.topic)
      .withCounts()
      .withCommentPreview()
      .withAuthor()
      .withTaxonomy()
      .withVotes()
      .orderBy('createdAt', 'desc')
      .paginate(page, perPage)

    if (routeIdentifier) {
      const baseUrl = router.makeUrl(routeIdentifier, routeParams)
      paginator.baseUrl(baseUrl)
    }

    paginator.queryString(filters)

    return DiscussionListDto.fromPaginator(paginator, { start: 1, end: paginator.lastPage })
  }
}
