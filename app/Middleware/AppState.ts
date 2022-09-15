import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SettingsService from 'App/Services/Http/SettingsService'
import View from '@ioc:Adonis/Core/View'
import HttpIdentityService from 'App/Services/Http/HttpIdentityService'
import NotificationService from 'App/Services/NotificationService'
import PostService from 'App/Services/PostService'
// import SecurityService from 'App/Services/SecurityService'

export default class AppState {
  public async handle (ctx: HttpContextContract, next: () => Promise<void>) {
    const settings = (new SettingsService()).build()
    const httpIdentityService = new HttpIdentityService()
    let notifications = await NotificationService.getForDisplay(ctx.auth.user, true)

    if (ctx.request.method() === 'GET' && ctx.auth.user) {
      notifications = await NotificationService.getForDisplay(ctx.auth.user)
    }

    ctx.settings = settings

    View.global('settings', settings)
    View.global('identity', await httpIdentityService.getRequestIdentity())
    View.global('notifications', notifications)
    View.global('live', await PostService.checkLive())
    // View.global('isGraylisted', await SecurityService.isGraylisted(ctx.request.ip(), ctx.auth.user))

    // code for middleware goes here. ABOVE THE NEXT CALL
    await next()
  }
}
