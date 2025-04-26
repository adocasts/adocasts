import BaseAction from '#core/actions/base_action'
import { HttpContext } from '@adonisjs/core/http'

export default class RenderSignInPage extends BaseAction {
  async asController({ view }: HttpContext) {
    return view.render('pages/auth/signin')
  }
}
