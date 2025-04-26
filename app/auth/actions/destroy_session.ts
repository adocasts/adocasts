import BaseAction from '#core/actions/base_action'
import { HttpContext } from '@adonisjs/core/http'

export default class DestroySession extends BaseAction {
  forwardIgnore = ['signin', 'signup', 'users/menu']

  async asController({ auth, request, response, session }: HttpContext) {
    let { forward = '/' } = request.only(['forward'])

    await auth.use('web').logout()

    session.flash('success', 'You have been signed out. See you next time!')

    if (this.forwardIgnore.some((path) => forward.includes(path))) {
      forward = '/'
    }

    return response.redirect().toPath(forward || '/')
  }
}
