import BaseAction from '#actions/base_action'
import { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'

export default class RenderResetPassword extends BaseAction {
  async asController({ view, request, params }: HttpContext) {
    const isSignatureValid = request.hasValidSignature()
    const email = params.email
    const token = await hash.make(email)

    return view.render('pages/auth/password/reset', { isSignatureValid, email, token })
  }
}
