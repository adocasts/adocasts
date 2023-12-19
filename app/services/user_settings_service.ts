import User from "#models/user";
import Profile from "#models/profile";
import { emailNotificationValidator } from "#validators/user_setting_validator";
import router from "@adonisjs/core/services/router";
import emitter from "@adonisjs/core/services/emitter";
import vine from "@vinejs/vine";
import { usernameRule } from "#validators/auth_validator";
import AuthAttemptService from "./auth_attempt_service.js";
import { Infer } from '@vinejs/vine/types';

export default class UserSettingsService {
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

    const data = await vine.validate({ 
      schema: vine.object({ username: usernameRule }), 
      data: { username } 
    })

    await user.merge(data).save()

    return this.valid(`Your username has been successfully updated to ${username}`)
  }

  public static async updateEmail(user: User, payload: { [x: string]: any }) {
    const authAttemptsRemaining = await AuthAttemptService.remainingAttempts(user.email);

    if (authAttemptsRemaining <= 0) {
      return {
        success: false,
        message: "You've exceeded the maximum number of password attempts allowed. Please reset your password.",
        redirect: router.makeUrl('auth.password.forgot')
      }
    }

    const data = await vine.validate({
      schema: vine.object({
        email: vine.string().trim(),//.unique({ table: 'users', column: 'email' }), // TODO
        password: vine.string()
      }),
      data: payload
    })

    const signedUrl = router.makeSignedUrl('users.revert.email', {
      id: user.id,
      oldEmail: user.email,
      newEmail: data.email
    }, { expiresIn: '168h' })
    
    const isPasswordCorrect = await user.verifyPasswordForAuth(data.password)
    
    if (!isPasswordCorrect) {
      await AuthAttemptService.recordChangeEmailAttempt(user.email)

      const message = authAttemptsRemaining < 2
        ? `The provided password was incorrect. ${authAttemptsRemaining} attempt${authAttemptsRemaining === 1 ? '' : 's'} remaining.`
        : `The provided password was incorrect.`

      return {
        success: false,
        message
      }
    }

    const emailHistory = await user.related('emailHistory').create({
      emailFrom: user.email,
      emailTo: data.email
    })

    user.email = data.email
    await user.save()
    await AuthAttemptService.clearAttempts(data.email)

    await emitter.emit('email:changed', {
      user: user,
      oldEmail: emailHistory.emailFrom,
      signedUrl
    })

    return {
      success: true,
      message: 'Your email has been successfully changed'
    }
  }

  /**
   * Update user's email notification settings
   * @param user
   * @param data
   */
  public static async updateEmailNotifications(user: User | undefined, data: Infer<typeof emailNotificationValidator>) {
    const profile = await Profile.findByOrFail('userId', user?.id)

    profile.emailOnNewDeviceLogin = data.emailOnNewDeviceLogin ?? false
    profile.emailOnComment = data.emailOnComment ?? false
    profile.emailOnCommentReply = data.emailOnCommentReply ?? false
    profile.emailOnAchievement = data.emailOnAchievement ?? false

    await profile.save()

    return profile
  }

  public static invalid<T>(message: string, data: T | undefined = undefined) {
    return this.handler(false, message, data)
  }

  public static valid<T>(message: string, data: T | undefined = undefined) {
    return this.handler(true, message, data)
  }

  public static handler<T>(success: boolean, message: string, data: T) {
    return {
      success,
      flashStatus: success ? 'success' : 'error',
      message,
      data
    }
  }
}