import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Profile from 'App/Models/Profile'
import User from 'App/Models/User'
import UserSettingsService from 'App/Services/UserSettingsService'
import Route from '@ioc:Adonis/Core/Route'
import Event from '@ioc:Adonis/Core/Event'
import EmailNotificationValidator from 'App/Validators/EmailNotificationValidator'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import UserService from 'App/Services/UserService'
import StripeService from 'App/Services/StripeService'
import SessionLogService from 'App/Services/SessionLogService'

export default class UserSettingsController {
  public async index({ request, response, view, auth, params }: HttpContextContract) {
    if (!params.section) {
      params.section = 'account'
    }

    const profile = await Profile.findByOrFail('userId', auth.user!.id)

    if (params.section === 'account') {
      const sessionLogService = new SessionLogService(request, response)
      const sessions = await sessionLogService.getList(auth.user!)
      
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

  public async invoice({ view, params, auth }: HttpContextContract) {
    const stripeService = new StripeService()
    const invoice  = await stripeService.getInvoice(auth.user!, params.invoice)
    
    return view.render('pages/settings/invoices/show', { invoice })
  }

  public async updateUsername({ request, response, auth, session }: HttpContextContract) {
    const { username } = request.only(['username'])
    const { flashStatus, message } = await UserSettingsService.updateUsername(auth.user!, username)

    session.flash(flashStatus, message)

    return response.redirect().back()
  }

  public async updateEmail({ request, response, auth, session }: HttpContextContract) {
    const { email } = request.only([ 'email' ])
    const hasChanged = auth.user!.email !== email

    if (!hasChanged) {
      session.flash('success', 'Email remained the same')
      return response.redirect().back()
    }

    const { success, message, redirect } = await UserSettingsService.updateEmail(auth, request.body())

    if (!success) {
      session.flash('error', message)
      return redirect
        ? response.redirect(redirect)
        : response.redirect().back()
    }

    session.flash('success', message)

    return response.redirect().back()
  }

  public async revertEmail({ request, response, params, session }: HttpContextContract) {
    const isValid = request.hasValidSignature()
    const { id, oldEmail, newEmail } = params

    if (!isValid) {
      session.flash('error', 'Your email revert link has expired. Please contact support for assistance.')
      return response.redirect().toRoute('auth.signin.show')
    }

    const user = await User.findOrFail(id)

    await user.merge({ email: oldEmail }).save()
    await user.related('emailHistory').query().where({ emailFrom: oldEmail, emailTo: newEmail }).delete()

    Event.emit('email:reverted', { user })

    const signedUrl = Route.makeSignedUrl('auth.password.reset', {
      params: { email: oldEmail },
      expiresIn: '15m'
    })

    session.flash('success', 'Your email has been successfully reverted. Please resecure your account by changing your password.')
    return signedUrl
      ? response.redirect(signedUrl)
      : response.redirect().toRoute('auth.password.forgot')
  }

  public async updateNotificationEmails({ request, response, auth, session }: HttpContextContract) {
    const data = await request.validate(EmailNotificationValidator)

    await UserSettingsService.updateEmailNotifications(auth.user, data)

    session.flash('success', "Your email notification settings have been updated")

    return response.redirect().back()
  }

  public async disableNotificationField({ request, response, params, auth, session }: HttpContextContract) {
    const forwardTo = auth.user ? 'users.settings.index' : 'home.index'

    if (!request.hasValidSignature() || (auth.user && params.userId != auth.user.id)) {
      session.flash('error', 'Link signature is expired or invalid')
      return response.redirect().toRoute(forwardTo)
    }

    const profile = await Profile.findByOrFail('userId', params.userId)
    const notificationFields = [
      { field: 'emailOnComment', message: `You'll no longer recieve emails when someone comments on your content` }, 
      { field: 'emailOnCommentReply', message: `You'll no longer recieve emails when someone replies to your comments` }, 
      { field: 'emailOnAchievement', message: `You'll no longer recieve emails when you unlock achievements` }
    ]
    const field = notificationFields.find(({ field }) => field === params.field)

    if (!field) {
      session.flash('error', 'Provided field is invalid, please try again.')
      return response.redirect().toRoute(forwardTo)
    }

    profile[params.field] = false

    await profile.save()

    session.flash('success', field.message)

    return response.redirect().toRoute(forwardTo)
  }

  public async disableNotifications({ request, response, params, auth, session }: HttpContextContract) {
    const forwardTo = auth.user ? 'users.settings.index' : 'home.index'

    if (!request.hasValidSignature() || (auth.user && params.userId != auth.user.id)) {
      session.flash('error', 'Link signature is expired or invalid')
      return response.redirect().toRoute(forwardTo)
    }

    const profile = await Profile.findByOrFail('userId', params.userId)

    profile.emailOnAchievement = false
    profile.emailOnComment = false
    profile.emailOnCommentReply = false

    await profile.save()

    session.flash('success', `All activity based emails have been disabled.`)

    return response.redirect().toRoute(forwardTo)
  }

  public async deleteAccount({ request, response, auth, session }: HttpContextContract) {
    const _schema = schema.create({
      user_username: schema.string({ trim: true }, [rules.confirmed('username')])
    })

    const messages = {
      'username.confirmed': "The username provided does not match your username"
    }

    await request.validate({ schema: _schema, messages });
    
    const success = await UserService.destroy(auth.user!)

    if (!success) {
      session.flash('error', 'Apologies, but something went wrong. Please email tom@adocasts.com if this persists.')
      return response.redirect().back()
    }
    
    await auth.logout()

    session.flash('success', "Your account has been successfully deleted.")

    return response.redirect().toPath('/')
  }
}
