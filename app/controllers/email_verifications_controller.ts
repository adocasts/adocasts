import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import emitter from '@adonisjs/core/services/emitter'
import { DateTime } from 'luxon'

export default class EmailVerificationsController {
  public async send({ response, auth, session }: HttpContext) {
    emitter.emit('email:email_verification', { user: auth.user! })
    
    session.flash('success', 'Please check your email, a verification link will be sent shortly!')

    return response.redirect().back()
  }

  public async verify({ request, response, params, auth, session }: HttpContext) {
    if (!request.hasValidSignature('email_verification')) {
      session.flash('error', 'Your email verification link is either invalid or expired. Please try again.')
      return response.redirect().toPath('/')
    }

    if (!auth.user) {
      session.put('email_verification', request.url(true))
      return response.redirect().toRoute('auth.signin.create', {}, { 
        qs: { 
          action: 'email_verification'
        } 
      })
    }

    const email = params.email
    const user = await User.findByOrFail('email', email)

    user.emailVerified = email
    user.emailVerifiedAt = DateTime.now()

    await user.save()

    session.flash('success', 'Your email has been successfully verified, thank you!')

    return response.redirect().toPath('/')
  }
}