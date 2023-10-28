import { RequestContract } from '@ioc:Adonis/Core/Request';
import User from 'App/Models/User';
import { DateTime } from 'luxon';
import IdentityService from './IdentityService';
import SessionLog from 'App/Models/SessionLog';
import { ResponseContract } from '@ioc:Adonis/Core/Response';
import { string } from '@ioc:Adonis/Core/Helpers'
import Application from '@ioc:Adonis/Core/Application';
import Event from '@ioc:Adonis/Core/Event'
import ms from 'ms'
import SessionConfig from 'Config/session';

export default class SessionLogService {
  public cookieName = 'ado-ident'
  public cookieExpiry = '5y'

  constructor(protected request: RequestContract, protected response: ResponseContract) {}

  public get ipAddress() {
    const cfConnectingIp = this.request.header('Cf-Connecting-Ip')
    if (cfConnectingIp) return cfConnectingIp // should be user's ip
    const xForwardedFor = this.request.header('X-Forwarded-For')
    if (xForwardedFor) return xForwardedFor.split(',').at(0)! // should be user's ip
    return this.request.ip() // will be cloudflare's ip
  }

  public get userAgent() {
    return this.request.header('user-agent')
  }

  public get token() {
    return this.request.encryptedCookie(this.cookieName)
  }

  public async check(user: User) {
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

  public async onSignInExisting(user: User) {
    const isRememberSession = !!this.request.cookiesList().remember_web
    return this.onSignInSuccess(user, isRememberSession, true)
  }

  public async onSignInSuccess(user: User, isRememberSession: boolean = false, skipNewDevice: boolean = false) {
    const { ipAddress, userAgent } = this
    const { city, countryLong, countryShort } = await IdentityService.getLocation(ipAddress)
    const known = await this.getIsKnown(user)
    const token = string.generateRandom(16)

    await this.signOutTimedOut(user)
    
    const log = await user.related('sessions').create({
      ipAddress,
      userAgent,
      city,
      isRememberSession,
      country: countryLong,
      countryCode: countryShort,
      token,
      loginAt: DateTime.now(),
      loginSuccessful: true,
      lastTouchedAt: DateTime.now()
    })

    if (!user.profile) {
      await user.load('profile')
    }

    if (!known && !skipNewDevice && user.profile.emailOnNewDeviceLogin && !Application.inTest) {
      Event.emit('email:new_device', { user, log })
    }

    this.response.encryptedCookie(this.cookieName, token, {
      maxAge: this.cookieExpiry,
      httpOnly: true,
    })

    return log
  }

  public async onSignOutSuccess(user: User) {
    const { ipAddress, userAgent } = this
    let log = await this.getLatest(user)

    if (!log) {
      log = new SessionLog().merge({
        userId: user.id,
        ipAddress,
        userAgent
      })
    }

    log.logoutAt = DateTime.now()

    await log.save()

    this.response.clearCookie(this.cookieName)

    return log
  }

  public async onSignOutForce(user: User, logId: number) {
    await user.related('sessions').query()
      .where({ id: logId })
      .whereTrue('loginSuccessful')
      .update({
        forceLogout: true,
        logoutAt: DateTime.now()
      })
  }

  public async onSignOutForceAll(user: User) {
    await user.related('sessions').query()
      .whereNot('token', this.token)
      .whereTrue('loginSuccessful')
      .update({
        forceLogout: true,
        logoutAt: DateTime.now()
      })
  }

  public async getList(user: User) {
    await this.signOutTimedOut(user)

    const sessions = await user.related('sessions').query()
      .whereTrue('loginSuccessful')
      .whereFalse('forceLogout')
      .whereNull('logoutAt')
      .orderBy('lastTouchedAt', 'desc')

    const token = this.token
    return sessions.map(session => {
      session.isCurrentSession = session.token === token
      return session
    })
  }

  public async getIsKnown(user: User) {
    const { ipAddress, userAgent, token } = this
    return user.related('sessions').query()
      .where(query => query
        .if(ipAddress && userAgent, query => query.where(query => query.where({ ipAddress, userAgent })))
        .if(token, query => query.orWhere({ token }))
      )
      .whereTrue('loginSuccessful')
      .first()
  }

  public async getLatest(user: User) {
    if (!this.token) return
    return user.related('sessions').query()
      .where('token', this.token)
      .whereTrue('loginSuccessful')
      .orderBy('loginAt', 'desc')
      .first()
  }

  public async signOutTimedOut(user: User) {
    const expiry = DateTime.now().minus({ milliseconds: ms(SessionConfig.age) })
    const rememberExpiry = DateTime.now().minus({ years: 5 }) // rememberMeToken = 5yr duration

    console.log(`Signing out expired sessions for user ${user.id}. Expiry = ${expiry.toString()}`)

    return user.related('sessions').query()
      .where('userId', user.id)
      .whereNull('logoutAt')
      .where(query => query
        .where(query => query // not a remembered session & last activity is beyond session duration
          .whereFalse('isRememberSession')
          .where('lastTouchedAt', '<=', expiry.toSQL())
        )
        .orWhere(query => query // a remembers ession & last activity is beyond remembered duration
          .whereTrue('isRememberSession')
          .where('lastTouchedAt', '<=', rememberExpiry.toSQL())
        )
      )
      .update({
        logoutAt: DateTime.now()
      })
  }
}