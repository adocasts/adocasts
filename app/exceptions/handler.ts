import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors } from '@vinejs/vine'
import logger from '#services/logger_service'

export default class HttpExceptionHandler extends ExceptionHandler {
  protected ignoreCodes = ['E_ROUTE_NOT_FOUND', 'E_BAD_CSRF_TOKEN']

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

  protected statusPages = {
    '404': async (error: unknown, { view, response }: HttpContext) => {
      const html = await view.render('errors/not-found', { error })
      response.send(html)
      return html
    },
    '500..599': async (error: unknown, { view, response }: HttpContext) => {
      const html = await view.render('errors/server-error', { error })
      response.send(html)
      return html
    },
  }

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    if (error instanceof errors.E_VALIDATION_ERROR && ctx.up.isUnpolyRequest) {
      ctx.up.setTarget(ctx.up.getFailTarget())
      ctx.up.setStatus(400)
      ctx.response.redirect().back()
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
    const alertIgnore = ['/assets/', '/schedule/']
    const url = ctx.request.url(true)

    // don't send these to our discord alerter, they seem to be bots
    if (!alertIgnore.some((path) => url.startsWith(path))) {
      await logger.error('error.report', {
        error,
        url: ctx.request.url(true),
        userId: ctx.auth?.user?.id,
        ip: ctx.request.ip(),
      })
    }

    return super.report(error, ctx)
  }
}
