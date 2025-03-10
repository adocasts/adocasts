import User from '#models/user'
import Comment from '#models/comment'
import BasePolicy from './base_policy.js'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import States from '#enums/states'

export default class CommentPolicy extends BasePolicy {
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

