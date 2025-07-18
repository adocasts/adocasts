import { sessionLogCookieName } from '#config/auth'
import { SessionLogFactory } from '#factories/session_log_factory'
import SessionLog from '#models/session_log'
import User from '#models/user'
import { ApiClient, ApiRequest } from '@japa/api-client'
import { PluginFn } from '@japa/runner/types'

declare module '@japa/api-client' {
  interface ApiRequest {
    sessionLogData: Partial<SessionLog>

    sessionLoginAs(user: User, sessionLogData?: Partial<SessionLog>): this
  }
}

export const sessionLogClient = () => {
  const pluginFn: PluginFn = function () {
    ApiRequest.macro(
      'sessionLoginAs',
      function (this: ApiRequest, user: User, sessionLogData?: Partial<SessionLog>) {
        this.withGuard('web').loginAs(user)
        this.sessionLogData = {
          ...sessionLogData,
          userId: user.id,
        }

        return this
      }
    )

    ApiClient.setup(async (request) => {
      const sessionLogData = request.sessionLogData

      if (!sessionLogData) return

      const sessionLog = await SessionLogFactory.merge(sessionLogData).create()

      request.withEncryptedCookie(sessionLogCookieName, sessionLog.token)
    })
  }

  return pluginFn
}
