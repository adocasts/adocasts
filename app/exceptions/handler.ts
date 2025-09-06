import { errors as coreErrors } from '@adonisjs/core'
import { ExceptionHandler, HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'
import { errors as limiterErrors } from '@adonisjs/limiter'
import { errors as shieldErrors } from '@adonisjs/shield'
import { errors as vineErrors } from '@vinejs/vine'

import logger from '#services/logger_service'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * Status pages are used to display a custom HTML pages for certain error
   * codes. You might want to enable them in production only, but feel
   * free to enable them in development as well.
   */
  protected renderStatusPages = app.inProduction

  /**
   * Status pages is a collection of error code range and a callback
   * to return the HTML contents to send as a response.
   */
  protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
    '404': (error, { view }) => {
      return view.render('pages/errors/not_found', { error })
    },
    '500..599': (error, { view }) => {
      return view.render('pages/errors/server_error', { error })
    },
  }

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    if (error instanceof limiterErrors.E_TOO_MANY_REQUESTS) {
      const message = error.getResponseMessage(ctx)
      const headers = error.getDefaultHeaders()

      if (ctx.up.isUnpolyRequest) {
        ctx.session.toast('error', message)
        return ctx.response.redirect().back()
      }

      Object.keys(headers).forEach((header) => {
        ctx.response.header(header, headers[header])
      })

      return ctx.response.status(error.status).send(message)
    }

    if (error instanceof shieldErrors.E_BAD_CSRF_TOKEN) {
      ctx.session.flashExcept(['password'])
      ctx.session.toast('error', 'Your session was expired or invalid. Please try again.')
      return ctx.response.redirect().back()
    }

    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    // if (env.get('HYPERDX_INTEGESTION_KEY')) {
    //   HyperDX.recordException(error)
    // }

    if (
      error instanceof coreErrors.E_ROUTE_NOT_FOUND ||
      error instanceof shieldErrors.E_BAD_CSRF_TOKEN ||
      error instanceof vineErrors.E_VALIDATION_ERROR ||
      error instanceof limiterErrors.E_TOO_MANY_REQUESTS
    ) {
      return super.report(error, ctx)
    }

    const url = ctx.request.url(true)
    const userAgent = ctx.request.header('User-Agent')
    const alertIgnorePaths = ['/assets/', '/schedule/']
    const alertIgnoreAgents = ['crawler', 'bot']
    const ignorePath = alertIgnorePaths.some((path) => url.startsWith(path))
    const ignoreAgent = alertIgnoreAgents.some((agent) => userAgent?.includes(agent))

    if (!ignorePath && !ignoreAgent) {
      await logger.error('error.report', {
        error,
        url: ctx.request.url(true),
        userId: ctx.auth?.user?.id,
        headers: {
          'User-Agent': userAgent,
          'X-Forwarded-For': ctx.request.header('X-Forwarded-For'),
          'X-Real-IP': ctx.request.header('X-Real-IP'),
          'Cf-Connecting-Ip': ctx.request.header('Cf-Connecting-Ip'),
          'Referer': ctx.request.header('Referer'),
        },
      })
    }

    return super.report(error, ctx)
  }
}
