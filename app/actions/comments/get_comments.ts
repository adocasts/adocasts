import BaseAction from '#actions/base_action'
import AuthorDto from '#dtos/author'
import CommentDto from '#dtos/comment'
import States from '#enums/states'
import NotImplementedException from '#exceptions/not_implemented_exception'
import Comment from '#models/comment'

export default class GetComments extends BaseAction {
  async handle(entityId: number, entityType: 'post' | 'discussion') {
    switch (entityType) {
      case 'post':
        return this.#getForPost(entityId)
      case 'discussion':
        return this.#getForDiscussion(entityId)
      default:
        throw new NotImplementedException(`GetComments does not implement ${entityType}`)
    }
  }

  async #getForPost(postId: number) {
    const count = await Comment.query().where({ postId }).where('stateId', States.PUBLIC)
    const list = await Comment.query()
      .where({ postId })
      .whereIn('stateId', [States.PUBLIC, States.ARCHIVED])
      .preload('user')
      .preload('userVotes', (votes) => votes.select('id'))
      .orderBy('createdAt')
      .dto(CommentDto)

    return { count, list }
  }

  async #getForDiscussion(discussionId: number) {
    const count = await Comment.query().where({ discussionId }).where('stateId', States.PUBLIC)
    const list = await Comment.query()
      .where({ discussionId })
      .preload('user', (user) => user.selectDto(AuthorDto))
      .preload('userVotes', (votes) => votes.select('comment_votes.id', 'comment_votes.user_id'))
      .where('stateId', [States.PUBLIC, States.ARCHIVED])
      .withCount('userVotes', (votes) => votes.as('voteCount'))
      .orderBy([
        { column: 'voteCount', order: 'desc' },
        { column: 'createdAt', order: 'desc' },
      ])
      .dto(CommentDto)

    return { count, list }
  }
}
