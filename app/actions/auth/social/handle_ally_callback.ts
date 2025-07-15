import BaseAction from '#actions/base_action'
import Profile from '#models/profile'
import stripe from '#services/stripe_service'
import { HttpContext } from '@adonisjs/core/http'
import GetAllyUser from './get_ally_user.js'
import OnSignInSucceeded from '../on_signin_succeeded.js'

export default class HandleAllyCallback extends BaseAction {
  async asController({ request, response, auth, ally, params, session }: HttpContext) {
    const wasAuthenticated = !!auth.user
    const social = ally.use(params.provider)
    const { user, ...result } = await GetAllyUser.run(social, params.provider, auth.user)

    if (!result.success) {
      session.flash('errors', { form: result.message })
      return response.redirect().toRoute('auth.signin')
    }

    await auth.use('web').login(user!, true)

    const hasProfile = await Profile.findBy('userId', user!.id)
    if (!hasProfile) {
      await user?.related('profile').create({})
    }

    await OnSignInSucceeded.run({ request, response, session }, user!, true)
    // await posthog.onAuthenticated(user!)

    if (wasAuthenticated) {
      session.toast('success', `Your ${params.provider} account has been successfully linked`)
      return response.redirect().toRoute('users.settings.index')
    }

    if (session.has('plan')) {
      const { status, message, checkout } = await stripe.tryCreateCheckoutSession(
        user!,
        session.get('plan')
      )

      if (status === 'warning' || status === 'error') {
        session.toast(status, message)
        return response.redirect('/')
      }

      return response.redirect(checkout!.url!)
    }

    session.toast(
      'success',
      hasProfile
        ? `Welcome back, ${auth.user!.username}`
        : `Welcome to Adocasts, ${auth.user!.username}`
    )
    return response.redirect('/')
  }
}
