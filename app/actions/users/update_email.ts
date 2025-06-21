import BaseAction from '#actions/base_action'
import AuthAttempt from '#models/auth_attempt'
import User from '#models/user'
import { updateEmailValidator } from '#validators/user_setting'
import { HttpContext } from '@adonisjs/core/http'
import emitter from '@adonisjs/core/services/emitter'
import router from '@adonisjs/core/services/router'
import db from '@adonisjs/lucid/services/db'
import { Infer } from '@vinejs/vine/types'

type Validator = Infer<typeof updateEmailValidator>

export default class UpdateEmail extends BaseAction<[User, Validator]> {
  async asController({ request, response, session, auth }: HttpContext) {
    const email = request.input('email')
    const user = auth.use('web').user!

    if (user.email === email) {
      session.flash('errors.email', 'The submitted email matches your current email')
      return response.redirect().back()
    }

    const data = await request.validateUsing(updateEmailValidator)

    if (await AuthAttempt.disallows(user.email)) {
      await auth.use('web').logout()

      session.flashErrors({
        form: 'Your account has been locked due to repeated bad login attempts. Please reset your password.',
      })

      return response.redirect('/forgot-password')
    }

    if (await this.#isPasswordInvalid(user, data)) {
      session.flash('email', data.email)
      session.flash('errors.password', 'Your password was incorrect, please try again')
      return response.redirect().back()
    }

    await this.handle(user, data)

    session.toast('success', 'Your email has been successfully updated')

    return response.redirect().back()
  }

  async handle(user: User, data: Validator) {
    const history = await db.transaction(async (trx) => {
      user.useTransaction(trx)

      const emailHistory = await user.related('emailHistory').create({
        emailFrom: user.email,
        emailTo: data.email,
      })

      await user.merge({ email: data.email }).save()
      await AuthAttempt.clear(user.email, trx)

      return emailHistory
    })

    const signedUrl = router.makeSignedUrl(
      'settings.revert.email',
      {
        id: user.id,
        oldEmail: history.emailFrom,
        newEmail: history.emailTo,
      },
      { expiresIn: '168h' }
    )

    await emitter.emit('email:changed', {
      user,
      oldEmail: history.emailFrom,
      signedUrl,
    })
  }

  async #isPasswordInvalid(user: User, data: Validator) {
    try {
      await User.verifyCredentials(user.email, data.password)
    } catch (_error) {
      await AuthAttempt.recordBadEmailChange(user.email)
      return true
    }
  }
}
