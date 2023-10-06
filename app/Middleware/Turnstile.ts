import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import Application from '@ioc:Adonis/Core/Application'

export default class Turnstile {
  public async handle({ turnstile, response }: HttpContextContract, next: () => Promise<void>) {
    if (Application.inTest) return next()

    // code for middleware goes here. ABOVE THE NEXT CALL
    if (!await turnstile.check()) {
      return response.redirect().back()
    }

    await next()
  }
}
