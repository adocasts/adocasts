import BaseAction from '#actions/base_action'
import User from '#models/user'
import { DateTime } from 'luxon'
import ms from 'ms'

export default class DestroyExpiredSessions extends BaseAction<[User]> {
  async handle(user: User) {
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
