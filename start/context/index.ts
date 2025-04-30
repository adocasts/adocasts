import { HttpContext } from '@adonisjs/core/http'
import TurnstileService from '#core/services/turnstile_service'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    turnstile: TurnstileService
    timezone: string
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
