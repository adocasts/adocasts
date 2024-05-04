import Watchlist from '#models/watchlist'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import UnauthorizedException from '#exceptions/unauthorized_exception'
import User from '#models/user'

@inject()
export default class WatchlistService {
  constructor(protected ctx: HttpContext) {}

  private get user() {
    return this.ctx.auth.user
  }

  /**
   * toggles watchlist item for user
   * @param data
   * @returns
   */
  async toggle(data: Partial<Watchlist>) {
    return WatchlistService.toggle(this.user, data)
  }

  static async toggle(user: User | undefined, data: Partial<Watchlist>) {
    if (!user) throw new UnauthorizedException('Watchlists require an authenticated user')

    const record = await Watchlist.query().where(data).where({ userId: user.id }).first()

    const watchlist = record
      ? await record.delete()
      : await Watchlist.create({ ...data, userId: user.id })

    return { watchlist, wasDeleted: !!record }
  }
}
