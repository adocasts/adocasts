import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors } from '@vinejs/vine'
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

  protected statusPages = {
    '404': (error: unknown, { view }: HttpContext) => view.render('errors/not-found', { error }),
    '500..599': (error: unknown, { view }: HttpContext) =>
      view.render('errors/server-error', { error }),
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

    const result = await super.handle(error, ctx)

    if (error && typeof error === 'object' && 'status' in error && result.includes('<html')) {
      ctx.response.send(result)
    }

    return result
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    logger.error('error.report', {
      error,
      url: ctx.request.url(true),
      userId: ctx.auth?.user?.id,
      ip: ctx.request.ip(),
    })

    return super.report(error, ctx)
  }
}
