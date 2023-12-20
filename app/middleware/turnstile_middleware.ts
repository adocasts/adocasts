import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import type { NextFn } from '@adonisjs/core/types/http'

export default class TurnstileMiddleware {
  async handle({ turnstile, response }: HttpContext, next: NextFn) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    if (!app.inTest && !await turnstile.check()) {
      return response.redirect().back()
    }

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}