import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { usernameValidation } from 'App/Validators/shared/validations'
import SettingService from 'App/Services/SettingService'
import Profile from 'App/Models/Profile'
import NotAllowedException from 'App/Exceptions/NotAllowedException'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Route from '@ioc:Adonis/Core/Route'
import Event from '@ioc:Adonis/Core/Event'
import User from 'App/Models/User'
import State from 'App/Enums/States'
import CacheService from 'App/Services/CacheService'

export default class SettingsController {
  public async index({ view, auth }: HttpContextContract) {
    const profile = await Profile.findByOrFail('userId', auth.user!.id)

    return view.render('studio/settings/index', { profile })
  }

  public async purgeCache({ response, session, bouncer }: HttpContextContract) {
    await bouncer.with('StudioPolicy').authorize('purgeCache')
    await CacheService.destroyAll()

    session.flash('success', 'All cached values have been successfully purged')

    return response.redirect().back()
  }

  public async emailUpdate({ request, response, auth, session }: HttpContextContract) {
    const { email } = request.only([ 'email' ]);
    const hasChanged = auth.user?.email !== email;

    if (!auth.user) {
      throw new NotAllowedException("You must be logged in to do this.");
    }

    if (!hasChanged) {
      session.flash('success', 'Email remained the same');
      return response.redirect().back();
    }

    const { success, message, redirect } = await SettingService.updateEmail(auth, request.body())

    if (!success) {
      session.flash('error', message)
      return redirect
        ? response.redirect(redirect)
        : response.redirect().back()
    }

    session.flash('success', message)

    return response.redirect().back()
  }

  public async emailRevert({ request, response, params, session }: HttpContextContract) {
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

  public async usernameUpdate({ request, response, auth, session }: HttpContextContract) {
    const { username } = request.only(['username'])
    const hasChanged = auth.user!.username.toLowerCase() !== username?.toLowerCase()

    if (!username) {
      session.flash('error', 'Please provide a new username')
      return response.redirect().back()
    }

    if (!hasChanged) {
      session.flash('success', "The submitted username matches your current username.")
      return response.redirect().back()
    }

    const data = await request.validate({
      schema: schema.create({ username: usernameValidation })
    })

    await auth.user!.merge(data).save()

    session.flash('success', `Your username has been successfully updated to ${username}.`)

    return response.redirect().back()
  }

  public async usernameUnique({ request, response, auth }: HttpContextContract) {
    const { username } = request.only(['username'])
    const unique = await SettingService.isUsernameUnique(auth.user, username)

    return response.json({ success: true, unique })
  }

  public async emailNotificationUpdate({ request, response, auth, session }: HttpContextContract) {
    const data = request.body()

    await SettingService.updateEmailNotifications(auth.user, data)

    session.flash('success', "Your email notification settings have been updated")

    return response.redirect().status(303).back()
  }

  public async deleteAccount({ request, response, auth, session }: HttpContextContract) {
    const _schema = schema.create({
      user_username: schema.string({ trim: true }, [rules.confirmed('username')])
    })

    const messages = {
      'username.confirmed': "The username provided does not match your username"
    }

    await request.validate({ schema: _schema, messages });

    await auth.user!.related('histories').query().delete()
    await auth.user!.related('watchlist').query().delete()
    await auth.user!.related('notifications').query().delete()
    await auth.user!.related('initiatedNotifications').query().delete()
    await auth.user!.related('emailHistory').query().delete()
    await auth.user!.related('commentVotes').query().update({ userId: null })

    // delete comments
    const comments = await auth.user!.related('comments').query()
      .withCount('responses', q => q.where('stateId', State.PUBLIC))

    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i]
      if (comment.$extras.responses_count === '0') {
        await comment.delete()
        continue;
      }

      comment.stateId = State.ARCHIVED
      comment.userId = null
      comment.body = '[deleted]'
      await comment.save()
    }

    // delete collections
    // restricted to me for now, we can skip this.

    // delete posts
    // restricted to me for now, we can skip this.

    // delete profile
    await auth.user!.related('profile').query().delete()

    // delete account
    await auth.user!.delete()
    await auth.logout()

    session.flash('success', "Your account has been successfully deleted.")

    return response.redirect().toRoute('home')
  }
}
