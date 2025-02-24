import SessionService from '#services/session_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { DateTime } from 'luxon'

@inject()
export default class SessionCheckMiddleware {
  constructor(protected sessionService: SessionService) {}

  async handle({ request, response, auth }: HttpContext, next: NextFn) {
    if (request.url().startsWith('/img/') || request.url().startsWith('/api/')) {
      await next()
      return
    }

    if (!auth.user) {
      response.clearCookie(this.sessionService.getCookieName())
      await next()
      return
    }

    const user = auth.user
    const { isOk, log } = await this.sessionService.check(user)

    if (!isOk) {
      await auth.use('web').logout()
      log.logoutAt = DateTime.now()
      await log.save()
    }

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}

