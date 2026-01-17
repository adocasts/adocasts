import BaseAction from '#actions/base_action'
import User from '#models/user'
import { updatePasswordValidator } from '#validators/user_setting'
import { HttpContext } from '@adonisjs/core/http'
import emitter from '@adonisjs/core/services/emitter'
import hash from '@adonisjs/core/services/hash'

export default class UpdatePassword extends BaseAction {
  async asController({ request, response, session, auth }: HttpContext) {
    const user = auth.use('web').user!

    const data = await request.validateUsing(updatePasswordValidator)

    if (!(await hash.verify(user.password, data.currentPassword))) {
      session.flash('errors.currentPassword', 'Your current password is incorrect')
      return response.redirect().back()
    }

    await this.handle(user, data.password)

    session.toast('success', 'Your password has been successfully updated')

    return response.redirect().back()
  }

  async handle(user: User, password: string) {
    await user.merge({ password }).save()
    await emitter.emit('password:changed', { user })
  }
}
