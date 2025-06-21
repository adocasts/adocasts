import BaseAction from '#actions/base_action'
import User from '#models/user'
import { HttpContext } from '@adonisjs/http-server'
import { DateTime } from 'luxon'

export default class VerifyEmail extends BaseAction<[string]> {
  async asController({ request, response, session, params, auth }: HttpContext) {
    if (!request.hasValidSignature('email_verification')) {
      session.toast(
        'error',
        'Your email verification link is either invalid or expired. Please try again.'
      )
      return response.redirect().toPath('/')
    }

    if (!auth.user) {
      session.put('email_verification', request.url(true))
      return response.redirect().toRoute(
        'auth.signin',
        {},
        {
          qs: {
            action: 'email_verification',
          },
        }
      )
    }

    await this.handle(params.email)

    session.toast('success', 'Your email has been successfully verified, thank you!')

    return response.redirect().toPath('/')
  }

  async handle(email: string) {
    const user = await User.findByOrFail('email', email)

    user.emailVerified = email
    user.emailVerifiedAt = DateTime.now()

    await user.save()

    return user
  }
}
