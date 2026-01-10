import TurnstileService from '#services/integrations/turnstile_service'
import { HttpContext, HttpRequest } from '@adonisjs/core/http'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    turnstile: TurnstileService
    timezone: string
  }

  interface HttpRequest {
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

HttpRequest.getter('sessionToken', function (this: HttpRequest) {
  return this.encryptedCookie('ado-ident')
})
  