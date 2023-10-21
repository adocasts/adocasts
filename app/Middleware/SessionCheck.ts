import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SessionLogService from 'App/Services/SessionLogService'

export default class SessionCheck {
  public async handle({ auth, request, response }: HttpContextContract, next: () => Promise<void>) {
    if (request.url().startsWith('/img/')) {
      await next()
      return
    }
    
    const sessionLogService = new SessionLogService(request, response)

    if (!auth.user) {
      response.clearCookie(sessionLogService.cookieName)
      await next()
      return
    }

    
    const user = auth.user
    const isOk = await sessionLogService.check(user)

    if (!isOk) {
      await auth.logout()
    }

    // code for middleware goes here. ABOVE THE NEXT CALL
    await next()
  }
}
