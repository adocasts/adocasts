import BaseAction from '#actions/base_action'
import { HttpContext } from '@adonisjs/core/http'

export default class RenderSignInPage extends BaseAction {
  async asController({ inertia }: HttpContext) {
    return inertia.render('auth/signin', {})
  }
}
