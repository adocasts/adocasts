import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PostTypes from 'App/Enums/PostTypes'
import PostService from 'App/Services/PostService'
import Route from '@ioc:Adonis/Core/Route'

export default class NewsController {
  public async index({ request, view }: HttpContextContract) {
    const { page = 1, sortBy = 'publishAt', sort = 'desc' } = request.qs()
    const items = await PostService.getPaginated(page, 12, sortBy, sort, PostTypes.NEWS, Route.makeUrl('news.index'))

    return view.render('pages/news/index', { items })
  }
}
