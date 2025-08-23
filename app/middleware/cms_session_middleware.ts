import { sessionCookie, sessionCookieName } from '#config/session'
import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class CmsSessionMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const output = await next()
    const user = ctx.auth?.user

    if (user && !user.isAdmin && !user.isContributor) {
      return output
    }

    // user is logging out (or session expired)
    if (!ctx.auth.isAuthenticated) {
      ctx.response.clearCookie(sessionCookieName, {
        ...sessionCookie,
        domain: env.get('CMS_SESSION_DOMAIN'),
      })

      ctx.response.clearCookie(ctx.session.sessionId, {
        ...sessionCookie,
        domain: env.get('CMS_SESSION_DOMAIN'),
      })

      return output
    }

    // sync the session to the CMS for users who can access
    if (ctx.auth.isAuthenticated) {
      ctx.response.clearCookie(sessionCookieName)
      ctx.response.clearCookie(ctx.session.sessionId)

      ctx.response.cookie(sessionCookieName, ctx.session.sessionId, {
        ...sessionCookie,
        domain: env.get('CMS_SESSION_DOMAIN'),
      })

      ctx.response.encryptedCookie(ctx.session.sessionId, ctx.session.all(), {
        ...sessionCookie,
        domain: env.get('CMS_SESSION_DOMAIN'),
      })
    }

    return output
  }
}
