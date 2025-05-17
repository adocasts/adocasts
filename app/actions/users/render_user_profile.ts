import BaseAction from '#actions/base_action'
import { HttpContext } from '@adonisjs/core/http'
import GetUserProfile from './get_user_profile.js'
import GetUserStats from './get_user_stats.js'

export default class RenderUserProfile extends BaseAction {
  async asController({ view, params }: HttpContext) {
    const user = await GetUserProfile.run(params.handle)
    const stats = await GetUserStats.run(user)

    return view.render('pages/users/profile', { user, stats })
  }
}
