import BaseAction from '#actions/base_action'
import User from '#models/user'

export default class GetNotes extends BaseAction {
  handle(user: User) {
    return user.related('notes').query().preload('post').orderBy('updatedAt', 'desc')
  }
}
