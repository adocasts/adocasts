import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Profile from 'App/Models/Profile'
import Route from '@ioc:Adonis/Core/Route'
import AuthSocialService from 'App/Services/AuthSocialService'
import StripeService from 'App/Services/StripeService'
import { inject } from '@adonisjs/core/build/standalone'

@inject()
export default class AuthSocialController {
  constructor(protected stripeService: StripeService) {}

  public async redirect ({ request, session, ally, params }: HttpContextContract) {
    const plan = request.qs().plan
    
    plan
      ? session.put('plan', plan)
      : session.forget('plan')

    await ally.use(params.provider).redirect()
  }

  public async callback ({ response, auth, ally, params, session }: HttpContextContract) {
    const wasAuthenticated = !!auth.user
    const { success, user, message } = await AuthSocialService.getUser(auth, ally, params.provider)

    if (!success) {
      session.flash('errors', { form: message })
      return response.redirect().toRoute('auth.signin')
    }

    await auth.login(user!, true)

    const hasProfile = await Profile.findBy('userId', user!.id)
    if (!hasProfile) {
      await user?.related('profile').create({})
    }

    if (wasAuthenticated) {
      session.flash('success', `Your ${params.provider} account has been successfully linked`)
      return response.redirect().toRoute('users.settings.index')
    }

    if (session.has('plan')) {
      const { status, message, checkout } = await this.stripeService.tryCreateCheckoutSession(user!, session.get('plan'))

      if (status === 'warning' || status === 'error') {
        session.flash(status, message)
        return response.redirect('/')
      }

      return response.redirect(checkout!.url!)
    }

    session.flash('success', hasProfile ? `Welcome back, ${auth.user!.username}` : `Welcome to Adocasts, ${auth.user!.username}`)
    return response.redirect('/')
  }

  public async unlink ({ response, auth, params, session }: HttpContextContract) {
    if (!auth.user!.password) {
      const signedUrl = Route.makeSignedUrl('auth.password.reset', {
        params: { email: auth.user!.email },
        expiresIn: '1h'
      });

      session.flash('error', `Please create a password for your account by following the password reset flow before unlinking ${params.provider}`)
      return response.redirect(signedUrl)
    }

    await AuthSocialService.unlink(auth.user!, params.provider)

    session.flash('success', `Your ${params.provider} account was unlinked from your account`)

    return response.redirect().back()
  }
}
