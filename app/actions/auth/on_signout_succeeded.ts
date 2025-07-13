import BaseAction from '#actions/base_action'
import GetIpAddress from '#actions/general/get_ip_address'
import GetUserAgent from '#actions/general/get_user_agent'
import { sessionLogCookieName } from '#config/auth'
import SessionLog from '#models/session_log'
import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

interface Event {
  ctx: HttpContext
  guardName: string
  user: User | null
  sessionId: string
}

export default class OnSignOutSucceeded extends BaseAction {
  async asListener({ ctx, user, sessionId }: Event) {
    if (!user) return

    const ipAddress = await GetIpAddress.run(ctx.request)
    const userAgent = ctx.request.header('user-agent')
    const token = ctx.request.encryptedCookie(sessionLogCookieName)
    let log = await this.#getLatest(user, token)

    if (!log) {
      const ua = await GetUserAgent.run(ctx.request)

      log = new SessionLog().merge({
        userId: user.id,
        ipAddress,
        userAgent,
        sessionId,
        browserName: ua?.browser?.name,
        browserEngine: ua?.engine?.name,
        browserVersion: ua?.browser?.version,
        deviceModel: ua?.device?.model,
        deviceType: ua?.device?.type,
        deviceVendor: ua?.device?.vendor,
        osName: ua?.os?.name,
        osVersion: ua?.os?.version,
      })
    }

    log.logoutAt = DateTime.now()

    await log.save()

    ctx.response.clearCookie(sessionLogCookieName)
  }

  async #getLatest(user: User, token: string | undefined) {
    if (!token) return

    return user
      .related('sessions')
      .query()
      .where('token', token)
      .where('loginSuccessful', true)
      .orderBy('loginAt', 'desc')
      .first()
  }
}
