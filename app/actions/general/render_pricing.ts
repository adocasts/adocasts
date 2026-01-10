import BaseAction from '#actions/base_action'
import { HttpContext } from '@adonisjs/core/http'

export default class RenderPricing extends BaseAction {
  async asController({ view }: HttpContext) {
    view.share({ isPricingPage: true })
    return view.render('pages/pricing')
  }
}
