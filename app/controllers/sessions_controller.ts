import SessionService from '#services/session_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

export default class SessionsController {
  async set({ request, response, session }: HttpContext) {
    const { target, value } = request.body()

    session.put(target, value)

    return response.status(204)
  }

  @inject()
  async destroy({ response, params, session, auth }: HttpContext, sessionService: SessionService) {
    if (params.id) {
      await sessionService.onSignOutForce(auth.user!, params.id)
      session.flash('success', 'Session has been terminated')
    } else {
      await sessionService.onSignOutForceAll(auth.user!)
      session.flash('success', 'All sessions, except your current session, have been terminated')
    }

    return response.redirect().back()
  }
}

