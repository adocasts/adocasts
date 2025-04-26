import BaseAction from '#core/actions/base_action'
import { HttpContext } from '@adonisjs/http-server'

export default class RenderUserMenu extends BaseAction {
  async asController({ view }: HttpContext) {
    return view.render('pages/users/menu')
  }
}
