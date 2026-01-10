import BaseAction from '#actions/base_action'
import { HttpContext } from '@adonisjs/core/http'

export default class HandleAllyRedirect extends BaseAction {
  async asController({ request, session, ally, params }: HttpContext) {
    const plan = request.input('plan')

    plan ? session.put('plan', plan) : session.forget('plan')

    await ally.use(params.provider).redirect()
  }
}
