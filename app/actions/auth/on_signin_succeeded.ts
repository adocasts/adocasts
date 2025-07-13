import BaseAction from '#actions/base_action'
import GetIpAddress from '#actions/general/get_ip_address'
import GetUserAgent from '#actions/general/get_user_agent'
import User from '#models/user'
import { RememberMeToken } from '@adonisjs/auth/session'
import stringHelpers from '@adonisjs/core/helpers/string'
import { HttpContext } from '@adonisjs/core/http'
import DestroyExpiredSessions from './destroy_expired_sessions.js'
import GetIpLocation from '#actions/general/get_ip_location'
import { DateTime } from 'luxon'
import { rememberMeTokensAge, sessionLogCookieName } from '#config/auth'
import app from '@adonisjs/core/services/app'
import emitter from '@adonisjs/core/services/emitter'

interface Event {
  ctx: HttpContext
  guardName: string
  user: User
  sessionId: string
  rememberMeToken?: RememberMeToken
}

export default class OnSignInSucceeded extends BaseAction {
  async asListener({ ctx, user, rememberMeToken, sessionId }: Event) {
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
      isRememberSession: !!rememberMeToken,
      rememberMeTokenId: rememberMeToken?.identifier ?? null,
      sessionId,
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

    ctx.response.encryptedCookie(sessionLogCookieName, token, {
      maxAge: rememberMeTokensAge,
      httpOnly: true,
    })
  }

  async #getKnown(
    user: User,
    ipAddress: string,
    userAgent: string | undefined,
    uaResult: UAParser.IResult | undefined
  ) {
    // Attempt a strong match first
    const strongMatch = await user
      .related('sessions')
      .query()
      .where('loginSuccessful', true)
      .andWhere((query) => {
        query.where('ipAddress', ipAddress)

        if (uaResult?.browser.name) {
          query.where('browserName', uaResult.browser.name)
        }

        if (uaResult?.os.name) {
          query.where('osName', uaResult.os.name)
        }

        if (uaResult?.os.version) {
          const majorOsVersion = uaResult.os.version.split('.')[0]
          query.where('osVersion', majorOsVersion)
        }

        if (uaResult?.device.type) {
          query.where('deviceType', uaResult.device.type)
        }

        if (uaResult?.device.model) {
          query.where('deviceModel', uaResult.device.model)
        } else {
          query.whereNull('deviceModel')
        }
      })
      .first()

    if (strongMatch) {
      return strongMatch
    }

    const weakMatch = await user
      .related('sessions')
      .query()
      .where('loginSuccessful', true)
      .where({
        ipAddress: ipAddress,
        userAgent: userAgent,
      })
      .first()

    return weakMatch
  }
}
