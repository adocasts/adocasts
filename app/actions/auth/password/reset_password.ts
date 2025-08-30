import BaseAction from '#actions/base_action'
import NotAllowedException from '#exceptions/not_allowed_exception'
import AuthAttempt from '#models/auth_attempt'
import User from '#models/user'
import logger from '#services/logger_service'
import { passwordResetValidator } from '#validators/auth'
import { HttpContext } from '@adonisjs/core/http'
import emitter from '@adonisjs/core/services/emitter'
import hash from '@adonisjs/core/services/hash'
import { Infer } from '@vinejs/vine/types'

type Validator = Infer<typeof passwordResetValidator>

export default class ResetPassword extends BaseAction {
  async asController({ request, response, session, auth }: HttpContext) {
    try {
      const data = await request.validateUsing(passwordResetValidator)

      if (!(await hash.verify(data.token, data.email))) {
        throw new NotAllowedException('The request structure is invalid.')
      }

      const user = await this.handle(data)

      await auth.use('web').login(user)

      session.toast('success', 'Your password has been successfully reset')

      return response.redirect('/')
    } catch (error) {
      const { email } = request.only(['email'])
      logger.error('PasswordResetController.resetPasswordStore', { email, error })

      session.toast(
        'error',
        'Something went wrong and we may not have been able to reset your password.'
      )

      return response.redirect().back()
    }
  }

  async handle({ email, password }: Validator) {
    const user = await User.findByOrFail('email', email)

    user.password = password

    await user.save()
    await emitter.emit('email:password_reset_success', { user })
    await AuthAttempt.clear(email)

    return user
  }
}
