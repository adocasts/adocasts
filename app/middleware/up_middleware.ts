import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class UpMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    ctx.view.share({ up: ctx.up })

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()

    ctx.up.commit()

    return output
  }
}