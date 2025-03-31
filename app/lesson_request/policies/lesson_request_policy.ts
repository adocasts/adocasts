import User from '#user/models/user'
import LessonRequest from '#lesson_request/models/lesson_request'
import BasePolicy from '#core/policies/base_policy'
import States from '#core/enums/states'

export default class LessonRequestPolicy extends BasePolicy {
  before(user: User) {
    if (this.isAdmin(user)) return true
  }

  async approve(_user: User, _lessonRequest: LessonRequest) {
    return false // restrict to admins
  }

  async reject(_user: User, _lessonRequest: LessonRequest) {
    return false // restrict to admins
  }

  async complete(_user: User, _lessonRequest: LessonRequest) {
    return false // restrict to admins
  }

  async vote(_: User) {
    return true // if they're authenticated they can vote
  }

  async store(_: User) {
    return true // if they're authenticated they can request
  }

  async update(user: User, lessonRequest: LessonRequest) {
    if (lessonRequest.stateId === States.ARCHIVED) return false
    const isOwner = lessonRequest.userId === user.id
    return isOwner
  }

  async delete(user: User, lessonRequest: LessonRequest) {
    if (lessonRequest.stateId === States.ARCHIVED) return false
    const isOwner = lessonRequest.userId === user.id
    return isOwner
  }
}
