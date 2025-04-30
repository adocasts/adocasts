import BaseAction from '#core/actions/base_action'
import { HttpContext } from '@adonisjs/core/http'

export default class RenderSignUpPage extends BaseAction {
  async asController({ view, up }: HttpContext) {
    const isPage = up.isPage

    console.log({ isPage })

    return view.render('pages/auth/signup')
  }
}
