import BaseAction from '#actions/base_action'
import { HttpContext } from '@adonisjs/core/http'

export default class RenderSignInPage extends BaseAction<[HttpContext]> {
  async asController({ view }: HttpContext) {
    return view.render('pages/auth/signin')
  }
}
