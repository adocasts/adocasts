import BaseAction from '#core/actions/base_action'
import DiscussionShowDto from '#discussion/dtos/discussion_show'
import Discussion from '#discussion/models/discussion'

export default class GetDiscussion extends BaseAction<[string]> {
  async handle(slug: string) {
    return Discussion.build()
      .where({ slug })
      .withComments()
      .withCounts()
      .withAuthor()
      .withTaxonomy()
      .withVotes()
      .firstOrFail(DiscussionShowDto)
  }
}
