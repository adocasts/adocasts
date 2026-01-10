import BaseAction from '#actions/base_action'
import { sessionLogCookieName } from '#config/auth'
import User from '#models/user'
import { HttpContext, Request, Response } from '@adonisjs/core/http'
import { Session } from '@adonisjs/session'
import { DateTime } from 'luxon'
import GetSessionLogToken from './get_session_log_token.js'

interface Event {
  ctx: HttpContext
  guardName: string
  user: User | null
  sessionId: string
}

type Arguments = [ctx: { request: Request; response: Response; session: Session }, user: User]

export default class OnSignOutSucceeded extends BaseAction {
  async asListener({ ctx, user }: Event) {
    if (!user) return
    await this.handle(ctx, user)
  }

  async handle(...args: Arguments) {
    const [ctx, user] = args
    const token = await GetSessionLogToken.run(ctx)
    const logs = await this.#getLogs(user, token)

    for (const log of logs) {
      log.logoutAt = DateTime.now()
      await log.save()
    }

    ctx.response.clearCookie(sessionLogCookieName)
    ctx.session.forget(sessionLogCookieName)
  }

  async #getLogs(user: User, token: string | undefined) {
    if (!token) return []

    return user
      .related('sessions')
      .query()
      .where('token', token)
      .where('loginSuccessful', true)
      .whereNull('logoutAt')
      .orderBy('loginAt', 'desc')
  }
}
