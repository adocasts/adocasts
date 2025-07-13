import OnAuthenticationSucceeded from '#actions/auth/on_authentication_succeeded'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class SessionCheckMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.user

    if (!user) {
      return next()
    }

    await OnAuthenticationSucceeded.run(ctx, user)

    return next()
  }
}
