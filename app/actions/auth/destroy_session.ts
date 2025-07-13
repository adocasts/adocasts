import BaseAction from '#actions/base_action'
import { HttpContext } from '@adonisjs/core/http'
import OnSignOutSucceeded from './on_signout_succeeded.js'

export default class DestroySession extends BaseAction {
  forwardIgnore = ['signin', 'signup', 'users/menu']

  async asController({ auth, request, response, session }: HttpContext) {
    let { forward = '/' } = request.only(['forward'])

    const user = auth.user

    if (!user) {
      session.toast('success', 'You were already signed out')
      return response.redirect().toPath(forward || '/')
    }

    await auth.use('web').logout()
    await OnSignOutSucceeded.run({ request, response, session }, user)

    session.toast('success', 'You have been signed out. See you next time!')

    if (this.forwardIgnore.some((path) => forward.includes(path))) {
      forward = '/'
    }

    return response.redirect().toPath(forward || '/')
  }
}
