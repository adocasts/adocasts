import BaseAction from '#actions/base_action'
import GetIpLocation from '#actions/general/get_ip_location'
import GetUserAgent from '#actions/general/get_user_agent'
import User from '#models/user'
import stringHelpers from '@adonisjs/core/helpers/string'
import { DateTime } from 'luxon'
import DestroyExpiredSessions from './destroy_expired_sessions.js'

type Arguments = [
  user: User,
  ipAddress: string | undefined,
  userAgent: string | undefined,
  sessionId: string,
  isRememberSession: boolean | undefined,
]

export default class StoreSessionLog extends BaseAction {
  async handle(...args: Arguments) {
    const [user, ipAddress, userAgent, sessionId, isRememberSession] = args

    const ua = await GetUserAgent.run(userAgent)
    const token = stringHelpers.generateRandom(16)
    const { city, countryLong, countryShort } = await GetIpLocation.run(ipAddress)

    await DestroyExpiredSessions.run(user)

    return user.related('sessions').create({
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
      isRememberSession: !!isRememberSession,
      sessionId: sessionId,
      country: countryLong,
      countryCode: countryShort,
      token: token,
      loginAt: DateTime.now(),
      loginSuccessful: true,
      lastTouchedAt: DateTime.now(),
    })
  }
}
