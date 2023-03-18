import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Encryption from '@ioc:Adonis/Core/Encryption'
import User from 'App/Models/User'
import Event from '@ioc:Adonis/Core/Event'
import { DateTime } from 'luxon'

export default class EmailVerificationController {
  public async send({ response, auth, session }: HttpContextContract) {
    Event.emit('verification:email:send', { user: auth.user })
    
    session.flash('success', 'Please check your email, a verification link will be sent shortly!')

    return response.redirect().back()
  }

  public async verify({ request, response, params, auth, session }: HttpContextContract) {
    if (!request.hasValidSignature('email_verification')) {
      session.flash('error', 'Your email verification link is either invalid or expired. Please try again.')
      return response.redirect().toPath('/')
    }

    if (!auth.user) {
      session.put('email_verification', request.url(true))
      return response.redirect().toRoute('auth.signin', {}, { 
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
