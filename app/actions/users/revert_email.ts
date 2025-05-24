import BaseAction from '#actions/base_action'
import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import emitter from '@adonisjs/core/services/emitter'
import router from '@adonisjs/core/services/router'
import db from '@adonisjs/lucid/services/db'

export default class RevertEmail extends BaseAction<[number, string, string]> {
  async asController({ request, response, params, session }: HttpContext) {
    const isValid = request.hasValidSignature()
    const { id, oldEmail, newEmail } = params

    if (!isValid) {
      session.flashErrors({
        form: 'The revert email link has expired. Please contact support for assistance.',
      })

      return response.redirect().toRoute('auth.signin')
    }

    const signedUrl = await this.handle(id, oldEmail, newEmail)

    session.flash(
      'success',
      'Your email has been reverted. Please resecure your account by changing your password.'
    )

    return response.redirect(signedUrl)
  }

  async handle(userId: number, emailFrom: string, emailTo: string) {
    const user = await User.findOrFail(userId)

    await db.transaction(async (trx) => {
      user.useTransaction(trx)

      await user.merge({ email: emailFrom }).save()
      await user.related('emailHistory').query().where({ emailFrom, emailTo }).delete()
    })

    await emitter.emit('email:reverted', { user })

    return router.makeSignedUrl('auth.password.reset', {
      params: { email: emailFrom },
      expiresIn: '30m',
    })
  }
}
