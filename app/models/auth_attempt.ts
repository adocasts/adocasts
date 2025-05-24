import AuthAttemptPurposes from '#enums/auth_attempt_purposes'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'

export default class AuthAttempt extends BaseModel {
  protected static allowedAttempts = 3

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uid: string

  @column()
  declare purposeId: number

  @column.dateTime()
  declare deletedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  //#region Attempts

  static async allows(uid: string) {
    return this.hasAttempts(uid)
  }

  static async disallows(uid: string) {
    return !(await this.hasAttempts(uid))
  }

  static async hasAttempts(uid: string) {
    const remaining = await this.remainingAttempts(uid)
    return remaining >= 0
  }

  static async remainingAttempts(uid: string) {
    const attempts = await this.badAttempts(uid)
    return this.allowedAttempts - attempts
  }

  static async badAttempts(uid: string): Promise<number> {
    const attempts = await AuthAttempt.query()
      .where({ uid })
      .whereNull('deletedAt')
      .count('id')
      .first()

    return Number.parseInt(attempts?.$extras.count ?? 0)
  }

  //#endregion
  //#region Actions

  static async clear(uid: string, trx?: TransactionClientContract) {
    await AuthAttempt.query({ client: trx })
      .where({ uid })
      .whereNull('deletedAt')
      .update({ deletedAt: DateTime.now() })
  }

  static async recordBadLogin(uid: string) {
    return AuthAttempt.create({
      uid,
      purposeId: AuthAttemptPurposes.LOGIN,
    })
  }

  static async recordBadEmailChange(uid: string) {
    return AuthAttempt.create({
      uid,
      purposeId: AuthAttemptPurposes.CHANGE_EMAIL,
    })
  }

  //#endregion
}
