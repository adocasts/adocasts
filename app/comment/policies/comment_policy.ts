import User from '#user/models/user'
import Comment from '#comment/models/comment'
import BasePolicy from '#core/policies/base_policy'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import States from '#core/enums/states'

export default class CommentPolicy extends BasePolicy {
  store(_user: User) {
    return true
  }

  reply(user: User, comment: Comment): AuthorizerResponse {
    if (comment.stateId === States.ARCHIVED) return false
    if (this.isAdmin(user)) return true

    return !!user
  }

  update(user: User, comment: Comment): AuthorizerResponse {
    if (comment.stateId === States.ARCHIVED) return false
    if (this.isAdmin(user)) return true

    const isOwner = comment.userId === user.id
    return isOwner
  }

  like(_user: User, _comment: Comment) {
    return true
  }

  delete(user: User, comment: Comment): AuthorizerResponse {
    if (comment.stateId === States.ARCHIVED) return false
    if (this.isAdmin(user)) return true

    const isOwner = comment.userId === user.id
    return isOwner
  }

  async state(user: User, comment: Comment): Promise<AuthorizerResponse> {
    if (this.isAdmin(user)) return true

    await comment.load('post', (query) => query.preload('authors'))
    return !!comment.post.authors.find((a) => a.id === user.id)
  }
}
