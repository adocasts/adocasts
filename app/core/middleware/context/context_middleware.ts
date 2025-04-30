import Page from '#components/utils/page'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { createProgress, ProgressContext } from './_progress.js'
import Up from './_up.js'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    [key: string]: string | number

    up: Up
    progress: ProgressContext
    page(page: () => JSX.Element, state?: Record<string, unknown>): Promise<any>
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

    ctx.page = async (page: () => JSX.Element, state?: Record<string, unknown>) => {
      ctx.progress.commit()
      ctx.up.commit()

      const res = await Page({ page, state }).fetch(ctx)
      // dd({ res, body: res.body })
      console.log({ res })
      if (res.body instanceof ReadableStream) {
        console.log('streaming page')
        return streamPage(res.body, ctx)
      }

      return res.text()
    }

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}

function streamPage(stream: ReadableStream<Uint8Array<ArrayBufferLike>>, ctx: HttpContext) {
  if (ctx.response.finished) {
    console.log('response finished, cancel')
    return stream.cancel()
  }
  console.log('getting reader')
  const reader = stream.getReader()
  console.log('got reader')
  const cancel = (error?: any) => {
    return reader.cancel(error)
  }

  const handle = ({
    done,
    value,
  }: {
    done: boolean
    value?: Uint8Array<ArrayBufferLike>
  }): void | Promise<void> => {
    console.log({ done })
    try {
      if (done) {
        ctx.response.response.end()
      } else if (ctx.response.response.write(value)) {
        reader.read().then(handle, cancel)
      } else {
        ctx.response.response.once('drain', () => reader.read().then(handle, cancel))
      }
    } catch (error) {
      cancel(error)
    }
  }

  ctx.response.response.on('close', cancel)
  ctx.response.response.on('error', cancel)

  reader.read().then(handle, cancel)

  return reader.closed.finally(() => {
    ctx.response.response.off('close', cancel)
    ctx.response.response.off('error', cancel)
  })
}
