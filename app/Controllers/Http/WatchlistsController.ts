import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import WatchlistValidator from 'App/Validators/WatchlistValidator'
import Watchlist from 'App/Models/Watchlist'
import WatchlistService from 'App/Services/WatchlistService'

export default class WatchlistsController {
  public async index({}: HttpContextContract) {}

  public async create({}: HttpContextContract) {}

  public async store({ request, response, auth }: HttpContextContract) {
    const data = await request.validate(WatchlistValidator)

    const watchlist = await auth.user!.related('watchlist').create(data)

    if (request.accepts(['json'])) {
      return response.json({ success: true, watchlist })
    }

    return response.redirect().back()
  }

  public async toggle({ request, response, auth }: HttpContextContract) {
    const data = await request.validate(WatchlistValidator)

    const [watchlist, wasDeleted] = await WatchlistService.toggle(auth.user!.id, data)

    if (request.accepts(['json'])) {
      return response.json({ success: true, watchlist, wasDeleted })
    }

    return response.redirect().back()
  }

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({ request, response, params }: HttpContextContract) {
    const watchlist = await Watchlist.firstOrFail(params.id)

    await watchlist.delete()

    if (request.accepts(['json'])) {
      return response.json({ success: true, watchlist })
    }

    return response.redirect().back()
  }
}
