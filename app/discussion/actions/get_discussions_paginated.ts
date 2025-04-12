import BaseAction from '#core/actions/base_action'
import Discussion from '#discussion/models/discussion'
import { discussionSearchValidator } from '#discussion/validators/discussion'
import { Infer } from '@vinejs/vine/types'

type Filters = Infer<typeof discussionSearchValidator> | undefined

export default class GetDiscussionsPaginated extends BaseAction<[Filters]> {
  public async handle({ page = 1, pattern, topic }: Filters = {}) {
    return Discussion.build()
      .search(pattern)
      .whereHasTaxonomy(topic)
      .withCounts()
      .withCommentPreview()
      .withAuthor()
      .withTaxonomy()
      .withVotes()
      .paginate(page, 20)
  }
}
