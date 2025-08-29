import ProgressableDto from '#dtos/progressable_dto'
import { SimplePaginatorDto } from '@adocasts.com/dto/paginator'
import is from '@adonisjs/core/helpers/is'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { createProgress, ProgressContext } from './_progress.js'
import Up from './_up.js'
import NotImplementedException from '#exceptions/not_implemented_exception'

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
      autoplayNext: this.#getAutoplayNext(ctx),
      showTranscript: this.#getShowTranscript(ctx),
    })

    ctx.view.render = async (templatePath: string, state?: Record<string, any>) => {
      this.#checkForProgressIds(ctx.progress, state)

      await ctx.progress.commit()
      ctx.up.commit()

      return viewRender.call(ctx.view, templatePath, state)
    }

    ctx.view.share = (data: Record<string, any>) => {
      this.#checkForProgressIds(ctx.progress, data)

      return viewShare.call(ctx.view, data)
    }

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }

  #checkForProgressIds(progress: ProgressContext, state?: Record<string, any>) {
    if (!state) return

    for (const key of Object.keys(state)) {
      const data = state[key]

      if (is.object(data) && Object.hasOwn(data, 'isProgressable')) {
        this.#addToProgress(progress, data as ProgressableDto)
      } else if (data instanceof SimplePaginatorDto) {
        this.#checkArrayForProgressIds(progress, data.data)
      } else if (is.array(data)) {
        this.#checkArrayForProgressIds(progress, data)
      }
    }
  }

  #checkArrayForProgressIds(progress: ProgressContext, array: unknown[]) {
    array.forEach((item) => {
      if (is.object(item) && Object.hasOwn(item, 'isProgressable')) {
        this.#addToProgress(progress, item as ProgressableDto)
      }
    })
  }

  #addToProgress(progress: ProgressContext, item: ProgressableDto) {
    switch (item.progressType) {
      case 'post':
        return progress.post.add(item.id)
      case 'collection':
        return progress.collection.add(item.id)
      default:
        throw new NotImplementedException(
          `ProgressableDto does not implement progress type: ${item.progressType}`
        )
    }
  }

  #getAutoplayNext(ctx: HttpContext) {
    if (ctx.auth.user) {
      return ctx.auth.user.isEnabledAutoplayNext
    }

    return ctx.session.get('autoplayNext', 'true') === 'true'
  }

  #getShowTranscript(ctx: HttpContext) {
    if (ctx.auth.user) {
      return ctx.auth.user.isEnabledTranscript
    }

    return ctx.session.get('showTranscript', 'false') === 'true'
  }
}
