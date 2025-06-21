import BaseAction from '#actions/base_action'
import emitter from '@adonisjs/core/services/emitter'
import { HttpContext } from '@adonisjs/http-server'

export default class SendEmailVerification extends BaseAction {
  async asController({ response, session, auth }: HttpContext) {
    await emitter.emit('email:email_verification', { user: auth.user! })

    session.toast('success', 'Please check your email, a verification link will be sent shortly!')

    return response.redirect().back()
  }
}
