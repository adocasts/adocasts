import SessionService from '#services/session_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

export default class SignOutController {
  @inject()
  async handle(
    { request, response, auth, session, up }: HttpContext,
    sessionService: SessionService
  ) {
    let { forward } = request.only(['forward'])
    const user = auth.user!

    await auth.use('web').logout()
    await sessionService.onSignOutSuccess(user)

    session.flash('success', 'You have been signed out. Cya next time!')

    up.setTarget('[up-theme]')

    if (
      forward?.includes('signin') ||
      forward?.includes('signup') ||
      forward?.includes('users/menu')
    ) {
      forward = '/'
    }

    return response.redirect().toPath(forward ?? '/')
  }
}

