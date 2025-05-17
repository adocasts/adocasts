import BaseAction from '#actions/base_action'
import User from '#models/user'

export default class GetUserProfile extends BaseAction<[string]> {
  async handle(handle: string) {
    const username = decodeURIComponent(handle.replace(/^@/, ''))
    return User.query().whereRaw('lower(username) = ?', [username]).preload('profile').firstOrFail()
  }
}
