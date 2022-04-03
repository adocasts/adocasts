import AuthAttemptPurpose from "App/Enums/AuthAttemptPurpose"
import AuthAttempt from "App/Models/AuthAttempt"
import { DateTime } from "luxon"

export default class AuthAttemptService {
  public static allowedAttempts: number = 3

  /**
   * Get number of bad logins attempted
   * @param  {string}          uid [description]
   * @return {Promise<number>}     [description]
   */
  public static async getAttempts(uid: string): Promise<number> {
    const attempts = (await AuthAttempt.query()
      .where('uid', uid)
      .whereNull('deletedAt')
      .count('id')
      .firstOrFail()).$extras.count

    return attempts
  }

  /**
   * Get remaining number of bad auth attempts before penalty
   * @param  {string}          uid [description]
   * @return {Promise<number>}     [description]
   */
  public static async getRemainingAttempts(uid: string): Promise<number> {
    const attempts = await this.getAttempts(uid)
    return this.allowedAttempts - attempts
  }

  /**
   * Removes bad authentication attempts for the user
   * @param  {string}        uid [description]
   * @return {Promise<void>}     [description]
   */
  public static async deleteBadAttempts(uid: string): Promise<void> {
    await AuthAttempt.query()
      .where('uid', uid)
      .whereNull('deletedAt')
      .update({ deletedAt: DateTime.now().toSQL() })
  }

  /**
   * Records a bad login attempt on the uid
   * @param  {string}        uid [description]
   * @return {Promise<void>}     [description]
   */
  public static async recordLoginAttempt(uid: string): Promise<void> {
    await AuthAttempt.create({
      uid,
      purposeId: AuthAttemptPurpose.LOGIN
    })
  }

  /**
   * Records a bad email change attempt on email
   * @param  {string}        email [description]
   * @return {Promise<void>}       [description]
   */
  public static async recordChangeEmailAttempt(email: string): Promise<void> {
    await AuthAttempt.create({
      uid: email,
      purposeId: AuthAttemptPurpose.CHANGE_EMAIL
    })
  }
}