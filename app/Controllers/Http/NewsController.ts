import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Post from 'App/Models/Post'
import Route from '@ioc:Adonis/Core/Route'
import CommentService from 'App/Services/CommentService'
import { inject } from '@adonisjs/fold'
import HistoryService from 'App/Services/Http/HistoryService'

@inject([HistoryService])
export default class NewsController {
  constructor(protected historyService: HistoryService) {}

  public async index ({ view, request }: HttpContextContract) {
    const { page = 1, sortBy = 'publishAt', sort = 'desc' } = request.qs()
    const items = await Post.news().orderBy(sortBy, sort).paginate(page, 12)

    items.baseUrl(Route.makeUrl('news.index'))

    return view.render('news/index', { items })
  }

  public async show({ view, params }: HttpContextContract) {
    const post = await Post.news().where({ slug: params.slug }).firstOrFail()
    const comments = await CommentService.getForPost(post)

    this.historyService.recordPostView(post.id)
    const userProgression = await this.historyService.getPostProgression(post)

    return view.render('lessons/show', { post, comments, userProgression })
  }
}
