import BaseAction from '#actions/base_action'
import User from '#models/user'
import { SocialProviders } from '@adonisjs/ally/types'
import router from '@adonisjs/core/services/router'
import { HttpContext } from '@adonisjs/http-server'

export default class HandleAllyUnlink extends BaseAction {
  async asController({ response, auth, params, session }: HttpContext) {
    const user = auth.user!

    if (!user.password) {
      const opts = { expiresIn: '1h' }
      const signedUrl = router.makeSignedUrl('auth.password.reset', { email: user.email }, opts)

      session.toast(
        'error',
        `Please create a password for your account by following the password reset flow before unlinking ${params.provider}`
      )

      return response.redirect(signedUrl)
    }

    await this.handle(user, params.provider)

    session.toast('success', `Your ${params.provider} account was unlinked from your account`)

    return response.redirect().back()
  }

  async handle(user: User, provider: keyof SocialProviders) {
    const userIdKey = `${provider}Id`
    const userEmailKey = `${provider}Email`

    user.merge({
      [userIdKey]: null,
      [userEmailKey]: null,
    })

    await user.save()
  }
}
