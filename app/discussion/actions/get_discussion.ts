import BaseAction from '#core/actions/base_action'
import DiscussionShowDto from '#discussion/dtos/discussion_show'
import Discussion from '#discussion/models/discussion'

export default class GetDiscussion extends BaseAction<[string | number]> {
  async handle(slugOrId: string | number) {
    const byColumn = typeof slugOrId === 'string' ? 'slug' : 'id'

    return Discussion.build()
      .where(byColumn, slugOrId)
      .withComments()
      .withCounts()
      .withAuthor()
      .withTaxonomy()
      .withVotes()
      .firstOrFail(DiscussionShowDto)
  }
}
