import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class PlusMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (!ctx.auth.user || ctx.auth.user.isFreeTier) {
      ctx.session.flash('info', 'Please upgrade to Adocasts Plus to use this feature')
      return ctx.response.redirect().toPath('/')
    }

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}

