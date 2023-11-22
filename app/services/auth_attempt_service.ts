import AuthAttemptPurposes from "#enums/auth_attempt_purposes"
import AuthAttempt from "#models/auth_attempt"
import { DateTime } from "luxon"

export default class AuthAttemptService {
  protected static allowedAttempts = 3

  /**
   * Gets the number of bad login attempts for a uid
   * @param uid 
   * @returns 
   */
  public static async badAttempts(uid: string): Promise<number> {
    const attempts = await AuthAttempt.query()
      .where({ uid })
      .whereNull('deletedAt')
      .count('id')
      .firstOrFail()

    return attempts.$extras.count
  }

  /**
   * Gets remaining number of bad attempts before penalty
   * @param uid 
   * @returns 
   */
  public static async remainingAttempts(uid: string) {
    const attempts = await this.badAttempts(uid)
    return this.allowedAttempts - attempts
  }

  /**
   * Gets whether uid has remaining auth attempts
   * @param uid 
   * @returns 
   */
  public static async hasAttempts(uid: string) {
    const remaining = await this.remainingAttempts(uid)
    return this.allowedAttempts - remaining
  }

  /**
   * Clears bad auth attempts for uid
   * @param uid 
   */
  public static async clearAttempts(uid: string) {
    await AuthAttempt.query()
      .where({ uid })
      .whereNull('deletedAt')
      .update({ deletedAt: DateTime.now() })
  }

  /**
   * Records a bad login attempt for the uid
   * @param uid 
   */
  public static async recordLoginAttempt(uid: string) {
    await AuthAttempt.create({
      uid,
      purposeId: AuthAttemptPurposes.LOGIN
    })
  }

  /**
   * Records a bad email change attempt for the uid
   * @param uid 
   */
  public static async recordChangeEmailAttempt(uid: string) {
    await AuthAttempt.create({
      uid,
      purposeId: AuthAttemptPurposes.CHANGE_EMAIL
    })
  }
}