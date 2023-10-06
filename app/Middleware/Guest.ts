import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Guest {
  public async handle({ response, session, auth }: HttpContextContract, next: () => Promise<void>) {
    if (auth.user) {
      session.flash('warning', 'You are already signed in')
      return response.redirect().back()
    }

    // code for middleware goes here. ABOVE THE NEXT CALL
    await next()
  }
}
