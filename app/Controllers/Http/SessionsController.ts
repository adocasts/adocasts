import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SessionLogService from 'App/Services/SessionLogService'

export default class SessionsController {
  public async set({ request, response, session }: HttpContextContract) {
    const { target, value } = request.body()

    session.put(target, value)

    return response.status(204)
  }

  public async destroy({ request, response, params, session, auth }: HttpContextContract) {
    const sessionLogService = new SessionLogService(request, response)

    if (params.id) {
      await sessionLogService.onSignOutForce(auth.user!, params.id)
      session.flash('success', 'Session has been terminated')
    } else {
      await sessionLogService.onSignOutForceAll(auth.user!)
      session.flash('success', "All sessions, except your current session, have been terminated")
    }

    return response.redirect().back()
  }
}
