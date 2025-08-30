import BaseAction from '#actions/base_action'
import Discussion from '#models/discussion'
import DiscussionShowDto from '../../dtos/discussion_show.js'

export default class GetDiscussion extends BaseAction {
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
