import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Post from 'App/Models/Post'
import Route from '@ioc:Adonis/Core/Route'
import CommentService from 'App/Services/CommentService'
import { inject } from '@adonisjs/fold'
import HistoryService from 'App/Services/Http/HistoryService'
import CollectionService from 'App/Services/CollectionService'

@inject([HistoryService])
export default class PostsController {
  constructor(protected historyService: HistoryService) {}

  public async index ({ view, request }: HttpContextContract) {
    const { page = 1, sortBy = 'publishAt', sort = 'desc' } = request.qs()
    const items = await Post.blogs()
      .apply(scope => scope.forDisplay())
      .orderBy(sortBy, sort)
      .paginate(page, 12)

    items.baseUrl(Route.makeUrl('lessons.index'))

    return view.render('blogs/index', { items })
  }

  public async show({ view, params, auth }: HttpContextContract) {
    const post = await Post.blogs().where({ slug: params.slug }).firstOrFail()
    const comments = await CommentService.getForPost(post)
    const series = await CollectionService.getSeriesForPost(post, auth.user?.id)

    this.historyService.recordPostView(post.id)
    const userProgression = await this.historyService.getPostProgression(post)

    return view.render('lessons/show', { post, comments, series, userProgression })
  }
}
