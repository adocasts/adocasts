import Profile from '#models/profile'
import AuthSocialService from '#services/auth_social_service'
// import posthog from '#services/posthog_service'
import SessionService from '#services/session_service'
import StripeService from '#services/stripe_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'

@inject()
export default class SocialController {
  constructor(
    protected authSocialService: AuthSocialService,
    protected sessionService: SessionService,
    protected stripeService: StripeService
  ) {}

  async redirect({ request, session, ally, params }: HttpContext) {
    const plan = request.qs().plan

    plan ? session.put('plan', plan) : session.forget('plan')

    await ally.use(params.provider).redirect()
  }

  async callback({ response, auth, params, session }: HttpContext) {
    const wasAuthenticated = !!auth.user
    const {
      success,
      user,
      message: formError,
    } = await this.authSocialService.getUser(params.provider)

    if (!success) {
      session.flash('errors', { form: formError })
      return response.redirect().toRoute('auth.signin.create')
    }

    await auth.use('web').login(user!, true)

    const hasProfile = await Profile.findBy('userId', user!.id)
    if (!hasProfile) {
      await user?.related('profile').create({})
    }

    await this.sessionService.onSignInSuccess(user!, true)
    // await posthog.onAuthenticated(user!)

    if (wasAuthenticated) {
      session.flash('success', `Your ${params.provider} account has been successfully linked`)
      return response.redirect().toRoute('users.settings.index')
    }

    if (session.has('plan')) {
      const { status, message, checkout } = await this.stripeService.tryCreateCheckoutSession(
        user!,
        session.get('plan')
      )

      if (status === 'warning' || status === 'error') {
        session.flash(status, message)
        return response.redirect('/')
      }

      return response.redirect(checkout!.url!)
    }

    session.flash(
      'success',
      hasProfile
        ? `Welcome back, ${auth.user!.username}`
        : `Welcome to Adocasts, ${auth.user!.username}`
    )
    return response.redirect('/')
  }

  async unlink({ response, auth, params, session }: HttpContext) {
    if (!auth.user!.password) {
      const signedUrl = router.makeSignedUrl(
        'auth.password.reset',
        {
          email: auth.user!.email,
        },
        {
          expiresIn: '1h',
        }
      )

      session.flash(
        'error',
        `Please create a password for your account by following the password reset flow before unlinking ${params.provider}`
      )
      return response.redirect(signedUrl)
    }

    await this.authSocialService.unlink(auth.user!, params.provider)

    session.flash('success', `Your ${params.provider} account was unlinked from your account`)

    return response.redirect().back()
  }
}

