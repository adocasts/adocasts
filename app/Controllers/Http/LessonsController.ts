import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Post from 'App/Models/Post'
import Route from '@ioc:Adonis/Core/Route'
import CommentService from 'App/Services/CommentService'
import { inject } from '@adonisjs/fold'
import HistoryService from 'App/Services/Http/HistoryService'
import Role from 'App/Enums/Roles'
import { Exception } from '@adonisjs/core/build/standalone'
import CollectionService from 'App/Services/CollectionService'
import CacheService from 'App/Services/CacheService'
import AnalyticsService from 'App/Services/AnalyticsService'

@inject([HistoryService])
export default class LessonsController {
  constructor(protected historyService: HistoryService) {}

  public async index({ view, request }: HttpContextContract) {
    const { page = 1, sortBy = 'publishAt', sort = 'desc' } = request.qs()
    const items = await Post.lessons()
      .apply(scope => scope.forDisplay())
      .orderBy(sortBy, sort)
      .paginate(page, 12)

    items.baseUrl(Route.makeUrl('lessons.index'))

    return view.render('lessons/index', { items })
  }

  public async show({ view, params, auth, session, request, up }: HttpContextContract) {
    const post = await CacheService.try(CacheService.getPostKey(params.slug), async () => {
      return Post.lessons()
        .apply(scope => scope.forDisplay(true))
        .where({ slug: params.slug })
        .highlightOrFail()
    })

    const postModel = Post.$createFromAdapterResult(post)
    const series = await CollectionService.getSeriesForPost(postModel!, auth.user?.id)
    
    if (post.isNotViewable && auth.user?.roleId !== Role.ADMIN) {
      throw new Exception('This post is not currently available to the public', 404)
    } else if (!post.isViewable && auth.user?.roleId !== Role.ADMIN) {
      return view.render('lessons/soon', { post, series })
    }

    const comments = await CommentService.getForPost(postModel!)
    const commentCount = await CommentService.getCountForPost(postModel!)
    const views = await AnalyticsService.getPageViews(request.url())

    this.historyService.recordPostView(post.id)
    const userProgression = await this.historyService.getPostProgression(postModel!)
    const skipVideoPlayer = session.get('videoPlayerId') == post.id && up.isUnpolyRequest && !up.isLayoutUpdate
    session.put('videoPlayerId', post.id)

    return view.render('lessons/show', { 
      post, 
      series, 
      comments, 
      commentCount, 
      userProgression, 
      views, 
      skipVideoPlayer
    })
  }
}
