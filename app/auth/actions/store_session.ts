import AuthAttempt from '#auth/models/auth_attempt'
import { signInValidator } from '#auth/validators/auth'
import BaseAction from '#core/actions/base_action'
import User from '#user/models/user'
import { HttpContext } from '@adonisjs/core/http'

export default class StoreSession extends BaseAction {
  async asController({ request, response, auth, session }: HttpContext) {
    const data = await request.validateUsing(signInValidator)

    if (await AuthAttempt.disallows(data.uid)) {
      session.flashErrors({
        form: 'Your account has been locked due to repeated bad login attempts. Please reset your password.',
      })
      return response.redirect('/forgot-password')
    }

    const user = await User.verifyCredentials(data.uid, data.password)

    await auth.use('web').login(user)
    await AuthAttempt.clear(data.uid)

    return response.redirect().toRoute('home')
  }
}
