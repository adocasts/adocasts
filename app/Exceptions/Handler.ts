/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ExceptionHandler extends HttpExceptionHandler {
  protected disableStatusPagesInDevelopment = true

  protected statusPages = {
    '403': 'errors/unauthorized',
    '404': 'errors/not-found',
    '500..599': 'errors/server-error',
  }

  constructor () {
    super(Logger)
  }

  public async handle(error: any, ctx: HttpContextContract) {
    if (error.code === 'E_BAD_CSRF_TOKEN') {
      return this.handleExpiredCsrf(ctx)
    }

    return super.handle(error, ctx)
  }

  public async handleExpiredCsrf(ctx: HttpContextContract) {
    if (!ctx.request.accepts(['json'])) {
      ctx.session.reflashExcept(['password'])
      ctx.session.flash('warn', "Your session was expired. We've refresh your session, please try again.")
      return ctx.response.redirect().withQs().back()
    }

    return ctx.response.status(419)
  }
}
