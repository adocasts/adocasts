import GetPaginatedSessions from '#actions/auth/get_paginated_sessions'
import BaseAction from '#actions/base_action'
import { HttpContext } from '@adonisjs/core/http'

export default class RenderUserSettings extends BaseAction {
  async asController({ view, request, params, auth }: HttpContext) {
    const section = params.section ?? 'account'

    if (section === 'account') {
      const sessions = await GetPaginatedSessions.run(auth.user!, request.sessionToken)
      view.share({ sessions })
    }

    return view.render(`pages/users/settings/${section}`, { section })
  }
}
