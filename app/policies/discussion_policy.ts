import User from '#models/user'
import Discussion from '#models/discussion'
import BasePolicy from './base_policy.js'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import States from '#enums/states'

export default class DiscussionPolicy extends BasePolicy {
  public before(user: User) {
    if (this.isAdmin(user)) return true
  }

  public vote(_: User): AuthorizerResponse {
    return true // if they're authenticated they can vote
  }
  
  public store(_: User): AuthorizerResponse {
    return true // if they're authenticated they can request
  }

  public update(user: User, discussion: Discussion): AuthorizerResponse {
    if (discussion.stateId === States.ARCHIVED) return false
    const isOwner = discussion.userId === user.id
    return isOwner
  }

  public delete(user: User, discussion: Discussion): AuthorizerResponse {
    if (discussion.stateId === States.ARCHIVED) return false
    const isOwner = discussion.userId === user.id
    return isOwner
  }
}