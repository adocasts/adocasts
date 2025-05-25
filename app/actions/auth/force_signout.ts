import BaseAction from '#actions/base_action'
import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class ForceSignOut extends BaseAction<
  [User, string | undefined, number | undefined]
> {
  async asController({ request, response, session, params, auth }: HttpContext) {
    await this.handle(auth.user!, request.sessionToken, params.id)

    if (params.id) {
      session.flash('success', 'Session has been terminated')
    } else {
      session.flash('success', 'All sessions, except your current session, have been terminated')
    }

    return response.redirect().back()
  }

  async handle(user: User, currentSessionToken?: string, sessionId?: number) {
    await user
      .related('sessions')
      .query()
      .if(sessionId, (query) => query.where({ id: sessionId }))
      .if(currentSessionToken, (query) => query.whereNot({ token: currentSessionToken }))
      .where('loginSuccessful', true)
      .update({
        forceLogout: true,
        logoutAt: DateTime.now(),
      })
  }
}
