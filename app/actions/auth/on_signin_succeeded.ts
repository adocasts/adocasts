import BaseAction from '#actions/base_action'
import GetIpAddress from '#actions/general/get_ip_address'
import GetUserAgent from '#actions/general/get_user_agent'
import { rememberMeTokensAge, sessionLogCookieName } from '#config/auth'
import User from '#models/user'
import { RememberMeToken } from '@adonisjs/auth/session'
import { HttpContext, Request, Response } from '@adonisjs/core/http'
import emitter from '@adonisjs/core/services/emitter'
import { Session } from '@adonisjs/session'
import StoreSessionLog from './store_session_log.js'

interface Event {
  ctx: HttpContext
  guardName: string
  user: User
  sessionId: string
  rememberMeToken?: RememberMeToken
}

type Arguments = [
  ctx: { request: Request; response: Response; session: Session },
  user: User,
  isRememberSession?: boolean,
  isSkipNewDevice?: boolean,
]

export default class OnSignInSucceeded extends BaseAction {
  async asListener({ ctx, user, rememberMeToken }: Event) {
    await this.handle(ctx, user, !!rememberMeToken)
  }

  async handle(...args: Arguments) {
    const [ctx, user, isRememberSession, isSkipNewDevice] = args

    const ipAddress = await GetIpAddress.run(ctx.request)
    const userAgent = ctx.request.header('user-agent')
    const sessionId = ctx.session.sessionId
    const ua = await GetUserAgent.run(ctx.request)
    const known = await this.#getKnown(user, ipAddress!, userAgent, ua)

    const log = await StoreSessionLog.run(user, ipAddress, userAgent, sessionId, isRememberSession)

    if (!user.profile) {
      await user.load('profile')
    }

    if (!known && !isSkipNewDevice && user.profile.emailOnNewDeviceLogin) {
      await emitter.emit('email:new_device', { user, log })
    }

    ctx.response.encryptedCookie(sessionLogCookieName, log.token, {
      maxAge: rememberMeTokensAge,
      httpOnly: true,
    })

    ctx.session.put(sessionLogCookieName, log.token)
  }

  async #getKnown(
    user: User,
    ipAddress: string,
    userAgent: string | undefined,
    ua: UAParser.IResult | undefined
  ) {
    return user
      .related('sessions')
      .query()
      .where((query) => {
        // confirm ip address, browser name, device model, os name, os version match current session
        if (
          ipAddress &&
          ua?.browser?.name &&
          ua?.device?.model &&
          ua?.os?.name &&
          ua?.os?.version
        ) {
          query.where((uaQuery) => {
            uaQuery
              .where({ ipAddress })
              .where('browserName', ua.browser.name!)
              .where('deviceModel', ua.device.model!)
              .where('osName', ua.os.name!)
              .where('osVersion', ua.os.version!)
          })
        }

        // or confirm ip address and user agent string as a whole match current session
        if (ipAddress && userAgent) {
          query.orWhere((ipQuery) => ipQuery.where({ ipAddress, userAgent }))
        }
      })
      .where('loginSuccessful', true)
      .first()
  }
}
