import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Turnstile {
  public async handle({ turnstile, response }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    if (!await turnstile.check()) {
      return response.redirect().back()
    }
console.log('here')
    await next()
  }
}
