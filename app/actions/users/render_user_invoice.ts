import BaseAction from '#actions/base_action'
import stripe from '#services/stripe_service'
import { HttpContext } from '@adonisjs/core/http'

export default class RenderUserInvoice extends BaseAction {
  async asController({ view, auth, params }: HttpContext) {
    const invoice = await stripe.getInvoice(auth.user!, params.invoice)

    return view.render('pages/users/settings/invoice', { invoice })
  }
}
