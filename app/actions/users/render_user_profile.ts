import BaseAction from '#actions/base_action'
import GetDiscussionsPaginated from '#actions/discussions/get_discussions_paginated'
import NotFoundException from '#exceptions/not_found_exception'
import User from '#models/user'
import { discussionSearchValidator } from '#validators/discussion'
import { HttpContext } from '@adonisjs/core/http'
import GetUserActivity from './get_user_activity.js'
import GetUserProfile from './get_user_profile.js'
import GetUserStats from './get_user_stats.js'

export default class RenderUserProfile extends BaseAction {
  async authorize({ params, auth }: HttpContext) {
    const user = await GetUserProfile.run(params.handle)

    if (!user.isEnabledProfile && auth.user?.id !== user.id) {
      throw new NotFoundException(`${params.handle}'s profile is currently set to private`)
    }

    return user
  }

  async asController({ view, request, params }: HttpContext, _: any, user: User) {
    const stats = await GetUserStats.run(user)
    const tab = params.tab === 'discussions' ? 'discussions' : 'activity'

    if (tab === 'activity') {
      const activity = await GetUserActivity.run(user)
      view.share({ activity })
    } else {
      const filters = await request.validateUsing(discussionSearchValidator)
      const discussions = await GetDiscussionsPaginated.run(
        { ...filters, userId: user.id },
        'users.profile',
        { handle: user.handle }
      )

      view.share({ discussions })
    }

    return view.render('pages/users/profile', { user, stats, tab })
  }
}
