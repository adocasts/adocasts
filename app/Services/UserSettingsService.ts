import User from "App/Models/User";
import BaseService from "./BaseService";
import Route from '@ioc:Adonis/Core/Route'
import Event from '@ioc:Adonis/Core/Event'
import { validator, rules, schema } from '@ioc:Adonis/Core/Validator'
import { usernameValidation } from "App/Validators/shared/validations";
import AuthAttemptService from "./AuthAttemptService";
import { AuthContract } from "@ioc:Adonis/Addons/Auth";

export default class UserSettingsService extends BaseService {
  /**
   * updates the user's username
   * @param user 
   * @param username 
   * @returns 
   */
  public static async updateUsername(user: User, username: string | undefined) {
    const hasChanged = user.username.toLowerCase() !== username?.toLowerCase()
    const hasChangedCase = !hasChanged && user.username !== username

    if (!username) {
      return this.invalid('Please provide a new username')
    }

    if (!hasChanged && !hasChangedCase) {
      return this.valid('The submitted username matches your current username')
    }

    if (hasChangedCase) {
      await user.merge({ username }).save()
      return this.valid(`The casing in your username has been successfully updated to ${username}`)
    }

    const _schema = schema.create({ username: usernameValidation })
    const data = await validator.validate({ schema: _schema, data: { username } })

    await user.merge(data).save()

    return this.valid(`Your username has been successfully updated to ${username}`)
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

    const signedUrl = Route.makeSignedUrl('users.revert.email', {
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

    const emailHistory = await auth.user!.related('emailHistory').create({
      emailFrom: auth.user!.email,
      emailTo: data.email
    })

    auth.user!.email = data.email
    await auth.user!.save()
    await AuthAttemptService.deleteBadAttempts(data.email)

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