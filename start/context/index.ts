import TurnstileService from '#services/turnstile_service'
import { HttpContext, Request } from '@adonisjs/core/http'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    turnstile: TurnstileService
    timezone: string
  }

  interface Request {
    sessionToken?: string
  }
}

HttpContext.getter(
  'turnstile',
  function (this: HttpContext) {
    return new TurnstileService(this)
  },
  true
)

HttpContext.getter('timezone', function (this: HttpContext) {
  const { timezone } = this.request.cookiesList()
  return timezone
})

Request.getter('sessionToken', function (this: Request) {
  return this.encryptedCookie('ado-ident')
})
