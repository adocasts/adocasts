import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import * as HyperDX from '@hyperdx/node-opentelemetry'

/**
 * Silent auth middleware can be used as a global middleware to silent check
 * if the user is logged-in or not.
 *
 * The request continues as usual, even when the user is not logged-in.
 */
export default class SilentAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    await ctx.auth.check()

    if (ctx.auth.user) {
      HyperDX.setTraceAttributes({
        userId: ctx.auth.user.id,
        userEmail: ctx.auth.user.email,
      })
    }

    return next()
  }
}
