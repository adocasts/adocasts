import BaseAction from '#actions/base_action'
import User from '#models/user'
import DestroyExpiredSessions from './destroy_expired_sessions.js'

interface Paginated {
  page: number
  perPage: number
}

export default class GetPaginatedSessions extends BaseAction {
  async handle(
    user: User,
    token?: string,
    { page, perPage }: Paginated = { page: 1, perPage: 15 }
  ) {
    await DestroyExpiredSessions.run(user)

    const sessions = await user
      .related('sessions')
      .query()
      .where('loginSuccessful', true)
      .where('forceLogout', false)
      .whereNull('logoutAt')
      .orderBy('lastTouchedAt', 'desc')
      .paginate(page, perPage)

    sessions.forEach((session) => {
      session.isCurrentSession = session.token === token
    })

    return sessions
  }
}
