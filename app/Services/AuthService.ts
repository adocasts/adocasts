import User from 'App/Models/User'
import AuthAttemptService from 'App/Services/AuthAttemptService'

export default class AuthService {
  /**
   * Change the provided user's email and record the change in case of disputes
   * @param user
   * @param email
   */
  public static async changeEmail(user: User, email: string) {
    const emailHistory = await user.related('emailHistory').create({
      emailFrom: user.email,
      emailTo: email
    })

    user.email = email

    await user.save()
    await AuthAttemptService.deleteBadAttempts(email)

    return emailHistory
  }
}
