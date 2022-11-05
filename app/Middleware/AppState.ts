import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SettingsService from 'App/Services/Http/SettingsService'
import View from '@ioc:Adonis/Core/View'
import HttpIdentityService from 'App/Services/Http/HttpIdentityService'
import NotificationService from 'App/Services/NotificationService'
import PostService from 'App/Services/PostService'

export default class AppState {
  /**
   * Populates info for every request
   * @param ctx 
   * @param next 
   */
  public async handle (ctx: HttpContextContract, next: () => Promise<void>) {
    const settings = (new SettingsService()).build()
    const httpIdentityService = new HttpIdentityService()

    // stub notification (empty state)
    let notifications = await NotificationService.getForDisplay(ctx.auth.user, true)

    // if GET request, get auth user's notifications
    if (ctx.request.method() === 'GET' && ctx.auth.user) {
      notifications = await NotificationService.getForDisplay(ctx.auth.user)
    }

    ctx.settings = settings

    // get global view properties
    View.global('settings', settings)
    View.global('identity', await httpIdentityService.getRequestIdentity())
    View.global('notifications', notifications)
    View.global('live', await PostService.checkLive())

    // code for middleware goes here. ABOVE THE NEXT CALL
    await next()
  }
}
