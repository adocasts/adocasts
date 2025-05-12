import DiscussionShowDto from '#dtos/discussion_show'
import States from '#enums/states'
import Discussion from '#models/discussion'
import User from '#models/user'
import BasePolicy from '#policies/base_policy'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class DiscussionPolicy extends BasePolicy {
  before(user: User) {
    if (this.isAdmin(user)) return true
  }

  vote(_: User): AuthorizerResponse {
    return true // if they're authenticated they can vote
  }

  store(_: User): AuthorizerResponse {
    return true // if they're authenticated they can request
  }

  update(user: User, discussion: Discussion | DiscussionShowDto): AuthorizerResponse {
    if (discussion.stateId === States.ARCHIVED) return false
    const isOwner = discussion.userId === user.id
    return isOwner
  }

  delete(user: User, discussion: Discussion | DiscussionShowDto): AuthorizerResponse {
    if (discussion.stateId === States.ARCHIVED) return false
    const isOwner = discussion.userId === user.id
    return isOwner
  }
}
