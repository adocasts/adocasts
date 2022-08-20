import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Post from 'App/Models/Post'
import Route from '@ioc:Adonis/Core/Route'
import CommentService from 'App/Services/CommentService'
import { inject } from '@adonisjs/fold'
import HistoryService from 'App/Services/Http/HistoryService'
import { Exception } from '@adonisjs/core/build/standalone'
import Role from 'App/Enums/Roles'
import CollectionService from 'App/Services/CollectionService'
import CacheService from 'App/Services/CacheService'

@inject([HistoryService])
export default class NewsController {
  constructor(protected historyService: HistoryService) {}

  public async index ({ view, request }: HttpContextContract) {
    const { page = 1, sortBy = 'publishAt', sort = 'desc' } = request.qs()
    const items = await Post.news()
      .apply(scope => scope.forDisplay())
      .orderBy(sortBy, sort)
      .paginate(page, 12)

    items.baseUrl(Route.makeUrl('news.index'))

    return view.render('news/index', { items })
  }

  public async show({ view, params, auth }: HttpContextContract) {
    const post = await CacheService.try(CacheService.getPostKey(params.slug), async () => {
      return Post.news()
        .apply(scope => scope.forDisplay(true))
        .where({ slug: params.slug })
        .highlightOrFail()
    })

    if (!post.isViewable && auth.user?.roleId !== Role.ADMIN) {
      throw new Exception('This post is not currently available to the public', 404)
    }

    const postModel = Post.$createFromAdapterResult(post)!
    const comments = await CommentService.getForPost(postModel)
    const series = await CollectionService.getSeriesForPost(postModel, auth.user?.id)

    this.historyService.recordPostView(post.id)
    const userProgression = await this.historyService.getPostProgression(postModel)

    return view.render('lessons/show', { post, comments, series, userProgression })
  }
}
