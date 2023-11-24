import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class SilentAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    const isAuth = await ctx.auth.use('web').check()

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}