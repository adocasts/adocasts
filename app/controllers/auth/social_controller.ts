import type { HttpContext } from '@adonisjs/core/http'

export default class SocialController {
  public async redirect ({ request, session, ally, params }: HttpContext) {
    // const plan = request.qs().plan
    
    // plan
    //   ? session.put('plan', plan)
    //   : session.forget('plan')

    // await ally.use(params.provider).redirect()
  }

  public async callback ({ request, response, auth, ally, params, session }: HttpContext) {
    // const wasAuthenticated = !!auth.user
    // const { success, user, message } = await AuthSocialService.getUser(auth, ally, params.provider)

    // if (!success) {
    //   session.flash('errors', { form: message })
    //   return response.redirect().toRoute('auth.signin')
    // }

    // await auth.login(user!, true)

    // const hasProfile = await Profile.findBy('userId', user!.id)
    // if (!hasProfile) {
    //   await user?.related('profile').create({})
    // }

    // const sessionLogService = new SessionLogService(request, response)
    // await sessionLogService.onSignInSuccess(user!, true)

    // if (wasAuthenticated) {
    //   session.flash('success', `Your ${params.provider} account has been successfully linked`)
    //   return response.redirect().toRoute('users.settings.index')
    // }

    // if (session.has('plan')) {
    //   const { status, message, checkout } = await this.stripeService.tryCreateCheckoutSession(user!, session.get('plan'))

    //   if (status === 'warning' || status === 'error') {
    //     session.flash(status, message)
    //     return response.redirect('/')
    //   }

    //   return response.redirect(checkout!.url!)
    // }

    // session.flash('success', hasProfile ? `Welcome back, ${auth.user!.username}` : `Welcome to Adocasts, ${auth.user!.username}`)
    // return response.redirect('/')
  }

  public async unlink ({ response, auth, params, session }: HttpContext) {
    // if (!auth.user!.password) {
    //   const signedUrl = Route.makeSignedUrl('auth.password.reset', {
    //     params: { email: auth.user!.email },
    //     expiresIn: '1h'
    //   });

    //   session.flash('error', `Please create a password for your account by following the password reset flow before unlinking ${params.provider}`)
    //   return response.redirect(signedUrl)
    // }

    // await AuthSocialService.unlink(auth.user!, params.provider)

    // session.flash('success', `Your ${params.provider} account was unlinked from your account`)

    // return response.redirect().back()
  }
}