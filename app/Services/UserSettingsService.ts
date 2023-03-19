import User from "App/Models/User";
import BaseService from "./BaseService";
import { validator, schema } from '@ioc:Adonis/Core/Validator'
import { usernameValidation } from "App/Validators/shared/validations";

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
}