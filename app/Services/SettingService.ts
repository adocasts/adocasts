import User from 'App/Models/User'
import Profile from 'App/Models/Profile'
import { rules, schema, validator } from '@ioc:Adonis/Core/Validator'
import { usernameValidation } from 'App/Validators/shared/validations'
import Route from '@ioc:Adonis/Core/Route'
import Event from '@ioc:Adonis/Core/Event'
import { AuthContract } from '@ioc:Adonis/Addons/Auth'
import AuthAttemptService from 'App/Services/AuthAttemptService'
import AuthService from 'App/Services/AuthService'

export default class SettingService {
  /**
   * Returns whether username is unique
   * @param user
   * @param username
   */
  public static async isUsernameUnique(user: User | undefined, username: string) {
    if (user && user.username.toLowerCase() === username.toLowerCase()) {
      return true
    }

    try {
      await validator.validate({
        schema: schema.create({ username: usernameValidation }),
        data: { username }
      })

      return true
    } catch (_) {
      return false
    }
  }

  /**
   * Update user's email notification settings
   * @param user
   * @param data
   */
  public static async updateEmailNotifications(user: User | undefined, data: { [x: string]: any }) {
    const _schema = schema.create({
      emailOnComment: schema.boolean.optional(),
      emailOnCommentReply: schema.boolean.optional(),
      emailOnAchievement: schema.boolean.optional()
    });

    const _data = await validator.validate({ schema: _schema, data })
    const profile = await Profile.findByOrFail('userId', user?.id)

    profile.emailOnComment = _data.emailOnComment ?? false
    profile.emailOnCommentReply = _data.emailOnCommentReply ?? false
    profile.emailOnAchievement = _data.emailOnAchievement ?? false

    await profile.save()

    return profile
  }

  public static async updateEmail(auth: AuthContract, payload: { [x: string]: any }) {
    const authAttemptsRemaining = await AuthAttemptService.getRemainingAttempts(auth.user!.email);

    if (authAttemptsRemaining <= 0) {
      return {
        success: false,
        message: "You've exceeded the maximum number of password attempts allowed. Please reset your password.",
        redirect: Route.makeUrl('auth.password.forgot')
      }
    }

    const _schema = schema.create({
      email: schema.string({ trim: true }, [ rules.unique({ table: 'users', column: 'email' }) ]),
      password: schema.string({})
    });

    const data = await validator.validate({ schema: _schema, data: payload });

    const signedUrl = Route.makeSignedUrl('studio.settings.email.undo', {
      params: {
        id: auth.user!.id,
        oldEmail: auth.user!.email,
        newEmail: data.email
      },
      expiresIn: '168h'
    });

    try {
      await auth.verifyCredentials(auth.user!.email, data.password)
    } catch (error) {
      await AuthAttemptService.recordChangeEmailAttempt(auth.user!.email)

      const message = authAttemptsRemaining < 2
        ? `The provided password was incorrect. ${authAttemptsRemaining} attempt${authAttemptsRemaining === 1 ? '' : 's'} remaining.`
        : `The provided password was incorrect.`

      return {
        success: false,
        message
      }
    }

    const emailHistory = await AuthService.changeEmail(auth.user!, data.email)

    Event.emit('email:changed', {
      user: auth.user,
      oldEmail: emailHistory.emailFrom,
      signedUrl
    })

    return {
      success: true,
      message: 'Your email has been successfully changed'
    }
  }
}
