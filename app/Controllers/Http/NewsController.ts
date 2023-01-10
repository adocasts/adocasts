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
import AnalyticsService from 'App/Services/AnalyticsService'

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

  public async show({ request, view, session, params, auth, up }: HttpContextContract) {
    const post = await CacheService.try(CacheService.getPostKey(params.slug), async () => {
      return Post.news()
        .apply(scope => scope.forDisplay(true))
        .where({ slug: params.slug })
        .highlightOrFail()
    })

    const postModel = Post.$createFromAdapterResult(post)!
    const series = await CollectionService.getSeriesForPost(postModel, auth.user?.id)

    if (post.isNotViewable && auth.user?.roleId !== Role.ADMIN) {
      throw new Exception('This post is not currently available to the public', 404)
    } else if (!post.isViewable && auth.user?.roleId !== Role.ADMIN) {
      return view.render('lessons/soon', { post, series })
    }

    const comments = await CommentService.getForPost(postModel)
    const commentCount = await CommentService.getCountForPost(postModel!)
    const views = await AnalyticsService.getPageViews(request.url())
    
    this.historyService.recordPostView(post.id)
    const userProgression = await this.historyService.getPostProgression(postModel)

    // if not going to same lesson or no stored lesson, update the player
    const hasPlayerId = session.has('videoPlayerId')
    if (!hasPlayerId || (hasPlayerId && session.get('videoPlayerId') !== post.id)) {
      up.setTarget('[up-main], [up-player]')
    }

    session.put('videoPlayerId', post.id)

    view.share({
      player: { post, series }
    })
  

    return view.render('lessons/show', { post, comments, series, userProgression, commentCount, views })
  }
}
