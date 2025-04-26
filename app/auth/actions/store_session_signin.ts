import AuthAttempt from '#auth/models/auth_attempt'
import { signInValidator } from '#auth/validators/auth'
import BaseAction from '#core/actions/base_action'
import User from '#user/models/user'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'

export default class StoreSessionSignIn extends BaseAction {
  validator = signInValidator

  async asController(
    { response, auth, session }: HttpContext,
    { options, ...data }: Infer<typeof this.validator>
  ) {
    if (await AuthAttempt.disallows(data.uid)) {
      session.flashErrors({
        form: 'Your account has been locked due to repeated bad login attempts. Please reset your password.',
      })
      return response.redirect('/forgot-password')
    }

    const user = await User.verifyCredentials(data.uid, data.password)

    await auth.use('web').login(user, options.remember)
    await AuthAttempt.clear(data.uid)

    return response.redirect().toRoute('home')
  }
}
