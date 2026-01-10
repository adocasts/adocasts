import BaseAction from '#actions/base_action'
import GetIpAddress from '#actions/general/get_ip_address'
import User from '#models/user'
import { emailValidator } from '#validators/user'
import { HttpContext } from '@adonisjs/core/http'
import emitter from '@adonisjs/core/services/emitter'
import router from '@adonisjs/core/services/router'
import limiter from '@adonisjs/limiter/services/main'
import { Infer } from '@vinejs/vine/types'

type Validator = Infer<typeof emailValidator>

export default class SendForgotPassword extends BaseAction {
  validator = emailValidator

  async asController({ request, response, session }: HttpContext, data: Validator) {
    const ipAddress = await GetIpAddress.run(request)
    const { throttled } = await this.handle(data, ipAddress)

    if (throttled) {
      session.flash('error', 'Too many attempts. Please try again later.')
      return response.redirect().back()
    }

    session.flash(
      'success',
      'If an account exists with that email, a password reset link has been sent.'
    )

    return response.redirect().toRoute('auth.password.forgot.sent')
  }

  async handle({ email }: Validator, ipAddress: string | undefined) {
    const result = { throttled: false, success: false }
    const limitKey = `forgotPasswordSend_${ipAddress}`
    const limit = limiter.use({
      requests: 3,
      duration: '1 min',
      blockDuration: '1 hour',
    })

    try {
      const [throttle, user] = await limit.penalize(limitKey, () => {
        return User.findByOrFail('email', email)
      })

      if (throttle) {
        result.throttled = true
        return result
      }

      const signedUrl = router.makeSignedUrl('auth.password.reset', { email }, { expiresIn: '1h' })
      await emitter.emit('email:password_reset', { user, signedUrl })
    } catch (_error) {
      console.log({ _error })
    }

    result.success = true
    return result
  }
}
