import User from '#user/models/user'
import Discussion from '#discussion/models/discussion'
import BasePolicy from '#core/policies/base_policy'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import States from '#core/enums/states'

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

  update(user: User, discussion: Discussion): AuthorizerResponse {
    if (discussion.stateId === States.ARCHIVED) return false
    const isOwner = discussion.userId === user.id
    return isOwner
  }

  delete(user: User, discussion: Discussion): AuthorizerResponse {
    if (discussion.stateId === States.ARCHIVED) return false
    const isOwner = discussion.userId === user.id
    return isOwner
  }
}
