import BaseAction from '#actions/base_action'
import GetIpAddress from '#actions/general/get_ip_address'
import GetIpLocation from '#actions/general/get_ip_location'
import GetUserAgent from '#actions/general/get_user_agent'
import { rememberMeTokensAge, sessionLogCookieName } from '#config/auth'
import User from '#models/user'
import { RememberMeToken } from '@adonisjs/auth/session'
import stringHelpers from '@adonisjs/core/helpers/string'
import { HttpContext, Request, Response } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import emitter from '@adonisjs/core/services/emitter'
import { Session } from '@adonisjs/session'
import { DateTime } from 'luxon'
import DestroyExpiredSessions from './destroy_expired_sessions.js'

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
  isRememberSession: boolean | undefined,
]

export default class OnSignInSucceeded extends BaseAction<Arguments> {
  async asListener({ ctx, user, rememberMeToken }: Event) {
    await this.handle(ctx, user, !!rememberMeToken)
  }

  async handle(...args: Arguments) {
    const [ctx, user, isRememberSession] = args

    const ipAddress = await GetIpAddress.run(ctx.request)
    const userAgent = ctx.request.header('user-agent')
    const ua = await GetUserAgent.run(ctx.request)
    const known = await this.#getKnown(user, ipAddress!, userAgent, ua)
    const token = stringHelpers.generateRandom(16)
    const { city, countryLong, countryShort } = await GetIpLocation.run(ipAddress)

    await DestroyExpiredSessions.run(user)

    const log = await user.related('sessions').create({
      ipAddress,
      userAgent,
      browserName: ua?.browser?.name,
      browserEngine: ua?.engine?.name,
      browserVersion: ua?.browser?.version,
      deviceModel: ua?.device?.model,
      deviceType: ua?.device?.type,
      deviceVendor: ua?.device?.vendor,
      osName: ua?.os?.name,
      osVersion: ua?.os?.version,
      city,
      isRememberSession,
      sessionId: ctx.session.sessionId,
      country: countryLong,
      countryCode: countryShort,
      token: token,
      loginAt: DateTime.now(),
      loginSuccessful: true,
      lastTouchedAt: DateTime.now(),
    })

    if (!user.profile) {
      await user.load('profile')
    }

    if (!known && user.profile.emailOnNewDeviceLogin && !app.inTest) {
      await emitter.emit('email:new_device', { user, log })
    }

    console.log('setting token', token)

    ctx.response.encryptedCookie(sessionLogCookieName, token, {
      maxAge: rememberMeTokensAge,
      httpOnly: true,
    })

    ctx.session.put(sessionLogCookieName, token)
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
