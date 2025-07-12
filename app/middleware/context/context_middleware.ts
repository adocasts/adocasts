import ProgressableDto from '#dtos/progressable_dto'
import { SimplePaginatorDto } from '@adocasts.com/dto/paginator'
import is from '@adonisjs/core/helpers/is'
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
    const viewShare = ctx.view.share
    const theme = ctx.auth.user?.theme ?? ctx.request.cookie('adocasts-theme', 'system')

    ctx.up = new Up(ctx)
    ctx.progress = createProgress(ctx)
    ctx.view.share({
      up: ctx.up,
      theme,
    })

    ctx.view.render = async (templatePath: string, state?: Record<string, any>) => {
      checkForProgressIds(ctx.progress, state)

      await ctx.progress.commit()
      ctx.up.commit()

      return viewRender.call(ctx.view, templatePath, state)
    }

    ctx.view.share = (data: Record<string, any>) => {
      checkForProgressIds(ctx.progress, data)

      return viewShare.call(ctx.view, data)
    }

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}

function checkForProgressIds(progress: ProgressContext, state?: Record<string, any>) {
  if (!state) return

  for (const key of Object.keys(state)) {
    const data = state[key]

    if (is.object(data) && data instanceof ProgressableDto) {
      data.addToProgress(progress)
    } else if (data instanceof SimplePaginatorDto) {
      checkArrayForProgressIds(progress, data.data)
    } else if (is.array(data)) {
      checkArrayForProgressIds(progress, data)
    }
  }
}

function checkArrayForProgressIds(progress: ProgressContext, array: unknown[]) {
  array.forEach((item) => {
    if (item instanceof ProgressableDto) {
      item.addToProgress(progress)
    }
  })
}
