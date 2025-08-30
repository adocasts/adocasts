import BaseAction from '#actions/base_action'
import { HttpContext } from '@adonisjs/core/http'

export default class RenderFrag extends BaseAction {
  async asController({ view, params }: HttpContext) {
    const fragment = params['*'].join('/')

    view.share({ isFragment: true })

    return view.render(`components/frags/${fragment}`)
  }
}
