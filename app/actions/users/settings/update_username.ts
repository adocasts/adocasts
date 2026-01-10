import BaseAction from '#actions/base_action'
import User from '#models/user'
import { updateUsernameValidator } from '#validators/user_setting'
import { HttpContext } from '@adonisjs/core/http'

export default class UpdateUsername extends BaseAction {
  async asController({ request, response, session, auth }: HttpContext) {
    const user = auth.use('web').user!
    const username = request.input('username')
    const hasChanged = username && user.username.toLowerCase() !== username?.toLowerCase()
    const hasChangedCase = username && !hasChanged && user.username !== username

    if (!hasChanged && !hasChangedCase) {
      session.flash('errors.username', 'The submitted username matches your current username')
      return response.redirect().back()
    }

    if (hasChangedCase) {
      await this.handle(user, username)
      session.flash('success', 'The casing in your username has been successfully updated')
      return response.redirect().back()
    }

    const data = await request.validateUsing(updateUsernameValidator)

    await this.handle(user, data.username)

    session.flash('success', 'Your username has been successfully updated')

    return response.redirect().back()
  }

  async handle(user: User, username: string) {
    await user.merge({ username }).save()
  }
}
