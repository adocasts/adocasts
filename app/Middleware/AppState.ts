import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SettingsService from 'App/Services/Http/SettingsService'
import HttpIdentityService from 'App/Services/Http/HttpIdentityService'
import NotificationService from 'App/Services/NotificationService'
import PostService from 'App/Services/PostService'
import { PlayerData } from '@ioc:Adocasts/Player'

export default class AppState {
  /**
   * Populates info for every request
   * @param ctx 
   * @param next 
   */
  public async handle (ctx: HttpContextContract, next: () => Promise<void>) {
    if (ctx.route?.pattern.startsWith('/img')) {
      await next()
      return
    }

    const settings = (new SettingsService()).build()
    ctx.settings = settings

    if (ctx.request.method() !== 'GET') {
      await next()
      return
    }

    const httpIdentityService = new HttpIdentityService()

    // stub notification (empty state)
    let notifications = await NotificationService.getForDisplay(ctx.auth.user, true)

    // if GET request, get auth user's notifications
    if (ctx.auth.user) {
      notifications = await NotificationService.getForDisplay(ctx.auth.user)
    }

    // if handling non-unpoly GET request, clear stored playerId so it will re-render
    if (!ctx.up.isUnpolyRequest) {
      ctx.session.forget('videoPlayerId')
    }

    const postId = ctx.session.get('videoPlayerId')
    
    // only populate player when traversing pages with unpoly
    let player: PlayerData | undefined
    if (ctx.up.isUnpolyRequest) {
      player = await PostService.getPlayerData(postId, ctx.auth.user)
    }

    // get global view properties
    ctx.view.share({ 
      settings: settings,
      identity: await httpIdentityService.getRequestIdentity(),
      live: await PostService.checkLive(),
      notifications,
      player
    })

    // code for middleware goes here. ABOVE THE NEXT CALL
    await next()
  }
}
