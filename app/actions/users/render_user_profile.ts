import BaseAction from '#actions/base_action'
import { HttpContext } from '@adonisjs/core/http'
import GetUserActivity from './get_user_activity.js'
import GetUserProfile from './get_user_profile.js'
import GetUserStats from './get_user_stats.js'

export default class RenderUserProfile extends BaseAction {
  async asController({ view, params }: HttpContext) {
    const user = await GetUserProfile.run(params.handle)
    const stats = await GetUserStats.run(user)
    const tab = params.tab === 'discussions' ? 'discussions' : 'activity'

    if (tab === 'activity') {
      const activity = await GetUserActivity.run(user)
      view.share({ activity })
    } else {
    }

    return view.render('pages/users/profile', { user, stats, tab })
  }
}
