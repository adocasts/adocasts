import BaseAction from '#actions/base_action'
import User from '#models/user'

export default class GetUserProfile extends BaseAction {
  async handle(handle: string) {
    const username = decodeURIComponent(handle.replace(/^@/, '')).toLowerCase()
    return User.query().whereRaw('lower(username) = ?', [username]).preload('profile').firstOrFail()
  }
}
