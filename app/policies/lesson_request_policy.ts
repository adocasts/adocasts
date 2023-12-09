import User from '#models/user'
import LessonRequest from '#models/lesson_request'
import BasePolicy from './base_policy.js'
import States from '#enums/states'

export default class LessonRequestPolicy extends BasePolicy {
  public before(user: User) {
    if (this.isAdmin(user)) return true
  }

  public async approve(_user: User, _lessonRequest: LessonRequest) {
    return false // restrict to admins
  }

  public async reject(_user: User, _lessonRequest: LessonRequest) {
    return false // restrict to admins
  }

  public async complete(_user: User, _lessonRequest: LessonRequest) {
    return false // restrict to admins
  }

  public async vote(_: User) {
    return true // if they're authenticated they can vote
  }
  
  public async store(_: User) {
    return true // if they're authenticated they can request
  }

  public async update(user: User, lessonRequest: LessonRequest) {
    if (lessonRequest.stateId === States.ARCHIVED) return false
    const isOwner = lessonRequest.userId === user.id
    return isOwner
  }

  public async delete(user: User, lessonRequest: LessonRequest) {
    if (lessonRequest.stateId === States.ARCHIVED) return false
    const isOwner = lessonRequest.userId === user.id
    return isOwner
  }
}