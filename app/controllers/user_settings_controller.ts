import type { HttpContext } from '@adonisjs/core/http'
import Profile from '#models/profile'
import User from '#models/user'
import UserSettingsService from '#services/user_settings_service'
import router from '@adonisjs/core/services/router'
import emitter from '@adonisjs/core/services/emitter'
import { confirmUsernameValidator, emailNotificationValidator } from '#validators/user_setting_validator'
import StripeService from '#services/stripe_service'
import UserService from '#services/user_service'
import SessionService from '#services/session_service'
import { inject } from '@adonisjs/core'

export default class UserSettingsController {
  @inject()
  public async index({ view, auth, params }: HttpContext, sessionService: SessionService) {
    if (!params.section) {
      params.section = 'account'
    }

    const profile = await Profile.findByOrFail('userId', auth.user!.id)

    if (params.section === 'account') {
      const sessions = await sessionService.getList(auth.user!)
      
      view.share({ sessions })
    }

    if (params.section === 'billing') {
      const stripeService = new StripeService()
      const charges = await stripeService.getCharges(auth.user!)
      const invoices = await stripeService.getInvoices(auth.user!)
      const subscriptions = await stripeService.getSubscriptions(auth.user!)
      view.share({ charges, invoices, subscriptions })
    }

    return view.render(`pages/settings/${params.section}`, { profile })
  }

  @inject()
  public async invoice({ view, params, auth }: HttpContext, stripeService: StripeService) {
    const invoice  = await stripeService.getInvoice(auth.user!, params.invoice)
    
    return view.render('pages/settings/invoices/show', { invoice })
  }

  public async updateUsername({ request, response, auth, session }: HttpContext) {
    const { username } = request.only(['username'])
    const { flashStatus, message } = await UserSettingsService.updateUsername(auth.user!, username)

    session.flash(flashStatus, message)

    return response.redirect().back()
  }

  public async updateEmail({ request, response, auth, session }: HttpContext) {
    const { email } = request.only([ 'email' ])
    const hasChanged = auth.user!.email !== email

    if (!hasChanged) {
      session.flash('success', 'Email remained the same')
      return response.redirect().back()
    }

    const { success, message, redirect } = await UserSettingsService.updateEmail(auth.user!, request.body())
    
    if (!success) {
      session.flash('error', message)
      return redirect
        ? response.redirect(redirect)
        : response.redirect().back()
    }

    session.flash('success', message)

    return response.redirect().back()
  }

  public async revertEmail({ request, response, params, session }: HttpContext) {
    const isValid = request.hasValidSignature()
    const { id, oldEmail, newEmail } = params

    if (!isValid) {
      session.flash('error', 'Your email revert link has expired. Please contact support for assistance.')
      return response.redirect().toRoute('auth.signin.show')
    }

    const user = await User.findOrFail(id)

    await user.merge({ email: oldEmail }).save()
    await user.related('emailHistory').query().where({ emailFrom: oldEmail, emailTo: newEmail }).delete()

    await emitter.emit('email:reverted', { user })

    const signedUrl = router.makeSignedUrl('auth.password.reset', {
      params: { email: oldEmail },
      expiresIn: '15m'
    })

    session.flash('success', 'Your email has been successfully reverted. Please resecure your account by changing your password.')
    return signedUrl
      ? response.redirect(signedUrl)
      : response.redirect().toRoute('auth.password.forgot')
  }

  public async updateNotificationEmails({ request, response, auth, session }: HttpContext) {
    const data = await request.validateUsing(emailNotificationValidator)

    await UserSettingsService.updateEmailNotifications(auth.user, data)

    session.flash('success', "Your email notification settings have been updated")

    return response.redirect().back()
  }

  public async disableNotificationField({ request, response, params, auth, session }: HttpContext) {
    const forwardTo = auth.user ? 'users.settings.index' : 'home.index'

    if (!request.hasValidSignature() || (auth.user && params.userId != auth.user.id)) {
      session.flash('error', 'Link signature is expired or invalid')
      return response.redirect().toRoute(forwardTo)
    }

    const profile = await Profile.findByOrFail('userId', params.userId)
    const notificationFields = [
      { field: 'emailOnComment', message: `You'll no longer recieve emails when someone comments on your content` }, 
      { field: 'emailOnCommentReply', message: `You'll no longer recieve emails when someone replies to your comments` }, 
      { field: 'emailOnAchievement', message: `You'll no longer recieve emails when you unlock achievements` },
      { field: 'emailOnWatchlist', message: `You'll no longer recieve emails when your watchlist items are updated` }
    ]
    const field = notificationFields.find(({ field }) => field === params.field)

    if (!field) {
      session.flash('error', 'Provided field is invalid, please try again.')
      return response.redirect().toRoute(forwardTo)
    }

    profile.merge({ [params.field]: false })

    await profile.save()

    session.flash('success', field.message)

    return response.redirect().toRoute(forwardTo)
  }

  public async disableNotifications({ request, response, params, auth, session }: HttpContext) {
    const forwardTo = auth.user ? 'users.settings.index' : 'home.index'

    if (!request.hasValidSignature() || (auth.user && params.userId != auth.user.id)) {
      session.flash('error', 'Link signature is expired or invalid')
      return response.redirect().toRoute(forwardTo)
    }

    const profile = await Profile.findByOrFail('userId', params.userId)

    profile.emailOnAchievement = false
    profile.emailOnComment = false
    profile.emailOnCommentReply = false
    profile.emailOnNewDeviceLogin = false
    profile.emailOnWatchlist = false

    await profile.save()

    session.flash('success', `All activity based emails have been disabled.`)

    return response.redirect().toRoute(forwardTo)
  }

  public async deleteAccount({ request, response, auth, session }: HttpContext) {
    await request.validateUsing(confirmUsernameValidator)
    
    const success = await UserService.destroy(auth.user!)

    if (!success) {
      session.flash('error', 'Apologies, but something went wrong. Please email tom@adocasts.com if this persists.')
      return response.redirect().back()
    }
    
    await auth.use('web').logout()

    session.flash('success', "Your account has been successfully deleted.")

    return response.redirect().toPath('/')
  }
}
