import BaseAction from '#actions/base_action'
import GetIpAddress from '#actions/general/get_ip_address'
import GetIpLocation from '#actions/general/get_ip_location'
import { rememberMeTokensAge, sessionLogCookieName } from '#config/auth'
import User from '#models/user'
import { RememberMeToken } from '@adonisjs/auth/session'
import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import GetSessionLogToken from './get_session_log_token.js'

interface Event {
  ctx: HttpContext
  guardName: string
  user: User
  sessionId: string
  rememberMeToken?: RememberMeToken
}

type Arguments = [ctx: HttpContext, user: User]

export default class OnAuthenticationSucceeded extends BaseAction<Arguments> {
  async asListener({ ctx, user }: Event) {
    await this.handle(ctx, user)
  }

  async handle(...args: Arguments) {
    const [ctx, user] = args
    const ipAddress = await GetIpAddress.run(ctx.request)
    const token = await GetSessionLogToken.run(ctx)
    const log = await this.#getLog(user, token)

    // was this session terminated?
    if (!log || log.forceLogout || log.logoutAt) {
      await ctx.auth.use('web').logout()
      await log?.merge({ logoutAt: DateTime.now() }).save()
      return
    }

    // has the user's location changed?
    if (log.ipAddress !== ipAddress && ipAddress) {
      const location = await GetIpLocation.run(ipAddress)

      log.ipAddress = ipAddress
      log.city = location.city || null
      log.country = location.countryLong || null
      log.countryCode = location.countryShort || null
    }

    log.lastTouchedAt = DateTime.now()

    await log.save()

    // touch ident
    ctx.response.encryptedCookie(sessionLogCookieName, token, {
      maxAge: rememberMeTokensAge,
      httpOnly: true,
    })
  }

  async #getLog(user: User, token: string | undefined) {
    if (!token) return

    return user
      .related('sessions')
      .query()
      .where('token', token)
      .where('loginSuccessful', true)
      .whereNull('logoutAt')
      .orderBy('loginAt', 'desc')
      .first()
  }
}
