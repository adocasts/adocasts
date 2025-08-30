import BaseAction from '#actions/base_action'
import { sessionLogCookieName } from '#config/auth'
import { Request } from '@adonisjs/core/http'
import { Session } from '@adonisjs/session'

type HttpContextPartial = { session: Session; request: Request }

export default class GetSessionLogToken extends BaseAction {
  async handle({ request, session }: HttpContextPartial) {
    return request.encryptedCookie(sessionLogCookieName, session.get(sessionLogCookieName))
  }
}
