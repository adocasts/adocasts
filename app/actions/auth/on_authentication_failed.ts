import BaseAction from '#actions/base_action'
import { sessionLogCookieName } from '#config/auth'
import SessionLog from '#models/session_log'
import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import GetSessionLogToken from './get_session_log_token.js'

interface Event {
  ctx: HttpContext
  guardName: string
  error: Exception
  sessionId: string
}

export default class OnAuthenticationFailed extends BaseAction {
  async asListener({ ctx }: Event) {
    const token = await GetSessionLogToken.run(ctx)
    const logs = await this.#getLogs(token)

    for (const log of logs) {
      log.logoutAt = DateTime.now()
      await log.save()
    }

    ctx.response.clearCookie(sessionLogCookieName)
  }

  async #getLogs(token: string | undefined) {
    if (!token) return []

    return SessionLog.query()
      .where('token', token)
      .where('loginSuccessful', true)
      .whereNull('logoutAt')
      .orderBy('loginAt', 'desc')
  }
}
