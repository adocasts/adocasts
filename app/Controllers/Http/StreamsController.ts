import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PostTypes from 'App/Enums/PostTypes'
import PostService from 'App/Services/PostService'
import Route from '@ioc:Adonis/Core/Route'

export default class StreamsController {
  public async index({ request, view }: HttpContextContract) {
    const { page = 1, sortBy = 'publishAt', sort = 'desc' } = request.qs()
    const items = await PostService.getPaginated(page, 12, sortBy, sort, PostTypes.LIVESTREAM, Route.makeUrl('streams.index'))
    const live = await PostService.getActiveStream()

    return view.render('pages/streams/index', { items, live })
  }
}
