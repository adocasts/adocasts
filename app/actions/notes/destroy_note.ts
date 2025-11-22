import BaseAction from '#actions/base_action'
import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'

export default class DestroyNote extends BaseAction {
  async asController({ response, params, session, auth }: HttpContext) {
    await this.handle(auth.user!, params.id)

    session.toast('success', 'Your note has been deleted')

    return response.redirect().back()
  }

  async handle(user: User, id: number) {
    const note = await user.related('notes').query().where({ id }).firstOrFail()

    await note.delete()

    return note
  }
}
