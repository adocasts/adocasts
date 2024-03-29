import SessionLog from '#models/session_log'
import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import emitter from '@adonisjs/core/services/emitter'
import { DateTime } from 'luxon'
import string from '@adonisjs/core/helpers/string'
import ms from 'ms'
import IdentityService from './identity_service.js'
import { inject } from '@adonisjs/core'
import { UAParser } from 'ua-parser-js'

@inject()
export default class SessionService {
  protected cookieName = 'ado-ident'
  protected cookieExpiry = '5y'

  constructor(protected ctx: HttpContext) {}

  get request() {
    return this.ctx.request
  }

  get response() {
    return this.ctx.response
  }

  get ipAddress() {
    const cfConnectingIp = this.request.header('Cf-Connecting-Ip')

    if (cfConnectingIp) return cfConnectingIp

    const xForwardedFor = this.request.header('X-Forwarded-For')

    if (xForwardedFor) return xForwardedFor.split(',').at(0)

    return this.request.ip()
  }

  get userAgent() {
    return this.request.header('user-agent')
  }

  get token() {
    return this.request.encryptedCookie(this.cookieName)
  }

  getCookieName() {
    return this.cookieName
  }

  async check(user: User) {
    const log = await this.getLatest(user)

    // don't kill pre-existing sessions, instead log their session
    if (!log) {
      await this.onSignInExisting(user)
      return true
    }

    if (log.forceLogout || log.logoutAt) return false

    if (log.ipAddress !== this.ipAddress && this.ipAddress) {
      const location = await IdentityService.getLocation(this.ipAddress)

      log.ipAddress = this.ipAddress
      log.city = location.city || null
      log.country = location.countryLong || null
      log.countryCode = location.countryShort || null
    }

    log.lastTouchedAt = DateTime.now()
    await log.save()

    return true
  }

  async onSignInExisting(user: User) {
    const isRememberSession = !!this.request.cookiesList().remember_web
    return this.onSignInSuccess(user, isRememberSession, true)
  }

  async onSignInSuccess(
    user: User,
    isRememberSession: boolean = false,
    skipNewDevice: boolean = false
  ) {
    const { ipAddress, userAgent } = this
    const { city, countryLong, countryShort } = await IdentityService.getLocation(ipAddress)
    const ua = UAParser(userAgent)
    const known = await this.getIsKnown(user, ua)
    const token = string.generateRandom(16)

    await this.signOutTimedOut(user)

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

    if (!known && !skipNewDevice && user.profile.emailOnNewDeviceLogin && !app.inTest) {
      await emitter.emit('email:new_device', { user, log })
    }

    this.response.encryptedCookie(this.cookieName, token, {
      maxAge: this.cookieExpiry,
      httpOnly: true,
    })

    return log
  }

  async onSignOutSuccess(user: User) {
    const { ipAddress, userAgent } = this
    let log = await this.getLatest(user)

    if (!log) {
      const ua = UAParser(userAgent)

      log = new SessionLog().merge({
        userId: user.id,
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
      })
    }

    log.logoutAt = DateTime.now()

    await log.save()

    this.response.clearCookie(this.cookieName)

    return log
  }

  async onSignOutForce(user: User, logId: number) {
    await user
      .related('sessions')
      .query()
      .where({ id: logId })
      .where('loginSuccessful', true)
      .update({
        forceLogout: true,
        logoutAt: DateTime.now(),
      })
  }

  async onSignOutForceAll(user: User) {
    await user
      .related('sessions')
      .query()
      .whereNot('token', this.token)
      .where('loginSuccessful', true)
      .update({
        forceLogout: true,
        logoutAt: DateTime.now(),
      })
  }

  async getList(user: User) {
    await this.signOutTimedOut(user)

    const sessions = await user
      .related('sessions')
      .query()
      .where('loginSuccessful', true)
      .where('forceLogout', false)
      .whereNull('logoutAt')
      .orderBy('lastTouchedAt', 'desc')

    const token = this.token
    return sessions.map((session) => {
      session.isCurrentSession = session.token === token
      return session
    })
  }

  async getIsKnown(user: User, ua: UAParser.IResult | undefined) {
    const { ipAddress, userAgent, token } = this
    return user
      .related('sessions')
      .query()
      .where(query => {
        // confirm ip address, browser name, device model, os name, os version match current session
        if (ipAddress && ua?.browser?.name && ua?.device?.model && ua?.os?.name && ua?.os?.version) {
          query.where(uaQuery => {
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
          query.orWhere(ipQuery => ipQuery.where({ ipAddress, userAgent }))
        }

        // or confirm with the device's issued token
        if (token) {
          query.orWhere({ token })
        }
      })
      .where('loginSuccessful', true)
      .first()
  }

  async getLatest(user: User) {
    if (!this.token) return
    return user
      .related('sessions')
      .query()
      .where('token', this.token)
      .where('loginSuccessful', true)
      .orderBy('loginAt', 'desc')
      .first()
  }

  async signOutTimedOut(user: User) {
    const expiry = DateTime.now().minus({ milliseconds: ms('2h') })
    const rememberExpiry = DateTime.now().minus({ years: 5 }) // rememberMeToken = 5yr duration

    console.log(`Signing out expired sessions for user ${user.id}. Expiry = ${expiry.toString()}`)

    return user
      .related('sessions')
      .query()
      .where('userId', user.id)
      .whereNull('logoutAt')
      .where((query) =>
        query
          .where((q2) =>
            q2 // not a remembered session & last activity is beyond session duration
              .where('isRememberSession', false)
              .where('lastTouchedAt', '<=', expiry.toSQL()!)
          )
          .orWhere((q2) =>
            q2 // a remembers session & last activity is beyond remembered duration
              .where('isRememberSession', true)
              .where('lastTouchedAt', '<=', rememberExpiry.toSQL()!)
          )
      )
      .update({
        logoutAt: DateTime.now(),
      })
  }
}
