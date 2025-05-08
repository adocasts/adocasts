import BaseAction from '#actions/base_action'
import DiscussionListDto from '../../dtos/discussion_list.js'
import Discussion from '#models/discussion'
import { discussionSearchValidator } from '#validators/discussion'
import router from '@adonisjs/core/services/router'
import { Infer } from '@vinejs/vine/types'

type Filters = Infer<typeof discussionSearchValidator> | undefined

export default class GetDiscussionsPaginated extends BaseAction<[Filters, string | undefined]> {
  public async handle(
    { page = 1, perPage = 20, pattern, topic, feed }: Filters = {},
    routeIdentifier?: string
  ) {
    const paginator = await Discussion.build()
      .search(pattern)
      .whereFeed(feed)
      .whereHasTaxonomy(topic)
      .withCounts()
      .withCommentPreview()
      .withAuthor()
      .withTaxonomy()
      .withVotes()
      .orderBy('createdAt', 'desc')
      .paginate(page, perPage)

    if (routeIdentifier) {
      const baseUrl = router.makeUrl(routeIdentifier)
      paginator.baseUrl(baseUrl)
    }

    paginator.queryString({ page, pattern, topic })

    return DiscussionListDto.fromPaginator(paginator, { start: 1, end: paginator.lastPage })
  }
}
