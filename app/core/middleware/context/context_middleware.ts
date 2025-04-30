import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { createProgress, ProgressContext } from './_progress.js'
import Up from './_up.js'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    up: Up
    progress: ProgressContext
  }
}

export default class ContextMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const viewRender = ctx.view.render

    ctx.up = new Up(ctx)
    ctx.progress = createProgress(ctx)

    ctx.view.share({
      up: ctx.up,
      progress: ctx.progress,
    })

    ctx.view.render = (templatePath: string, state?: Record<string, any>) => {
      ctx.progress.commit()
      ctx.up.commit()

      return viewRender.call(ctx.view, templatePath, state)
    }

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}
