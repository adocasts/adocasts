import { RequestContract } from '@ioc:Adonis/Core/Request';
import User from 'App/Models/User';
import { DateTime } from 'luxon';
import IdentityService from './IdentityService';
import SessionLog from 'App/Models/SessionLog';
import { ResponseContract } from '@ioc:Adonis/Core/Response';
import { string } from '@ioc:Adonis/Core/Helpers'

export default class SessionLogService {
  public cookieName = 'ado-ident'
  public cookieExpiry = '5y'

  constructor(protected request: RequestContract, protected response: ResponseContract) {}

  public get ipAddress() {
    return this.request.ip()
  }

  public get userAgent() {
    return this.request.header('user-agent')
  }

  public get token() {
    return this.request.encryptedCookie(this.cookieName)
  }

  public async check(user: User) {
    const log = await this.getLatest(user)
    
    // no log? have them reauthenticate
    if (!log) return false
    
    if (log.forceLogout || log.logoutAt) return false
    
    log.lastTouchedAt = DateTime.now()
    await log.save()

    return true
  }

  public async onSignInSuccess(user: User) {
    const { ipAddress, userAgent } = this
    const { city, country, countryCode } = await IdentityService.getLocation(ipAddress)
    const known = await this.getIsKnown(user)
    const token = string.generateRandom(16)
    
    const log = await user.related('sessions').create({
      ipAddress,
      userAgent,
      city,
      country,
      countryCode,
      token,
      loginAt: DateTime.now(),
      loginSuccessful: true,
    })

    if (!known) {
      console.log('new login device', { ipAddress, userAgent })
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
      const { city, country, countryCode } = await IdentityService.getLocation(ipAddress)
      log = new SessionLog().merge({
        userId: user.id,
        ipAddress,
        userAgent,
        city,
        country,
        countryCode
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

  public async getIsKnown(user: User) {
    const { ipAddress, userAgent, token } = this
    return user.related('sessions').query()
      .where(query => query
        .where(query => query.where({ ipAddress, userAgent }))
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
}