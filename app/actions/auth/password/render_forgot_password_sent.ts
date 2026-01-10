import BaseAction from '#actions/base_action'
import { HttpContext } from '@adonisjs/core/http'

export default class RenderForgotPasswordSent extends BaseAction {
  async asController({ view }: HttpContext) {
    return view.render('pages/auth/password/forgot_sent')
  }
}
