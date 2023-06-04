import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Profile from 'App/Models/Profile'
import User from 'App/Models/User'
import UserSettingsService from 'App/Services/UserSettingsService'
import Route from '@ioc:Adonis/Core/Route'
import Event from '@ioc:Adonis/Core/Event'
import EmailNotificationValidator from 'App/Validators/EmailNotificationValidator'
import States from 'App/Enums/States'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import UserService from 'App/Services/UserService'

export default class UserSettingsController {
  public async index({ view, auth }: HttpContextContract) {
    const profile = await Profile.findByOrFail('userId', auth.user!.id)

    return view.render('pages/users/settings', { profile })
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
