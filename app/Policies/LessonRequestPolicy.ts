import LessonRequest from "App/Models/LessonRequest";
import User from "App/Models/User";
import BasePolicy from "./BasePolicy";

export default class LessonRequestPolicy extends BasePolicy {
  public async before(user: User) {
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
    const isOwner = lessonRequest.userId === user.id
    return isOwner
  }

  public async delete(user: User, lessonRequest: LessonRequest) {
    const isOwner = lessonRequest.userId === user.id
    return isOwner
  }
}