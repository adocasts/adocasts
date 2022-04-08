import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Post from 'App/Models/Post'
import Route from '@ioc:Adonis/Core/Route'
import CommentService from 'App/Services/CommentService'
import { inject } from '@adonisjs/fold'
import HistoryService from 'App/Services/Http/HistoryService'

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

  public async show({ view, params, auth }: HttpContextContract) {
    const post = await Post.lessons()
      .apply(scope => scope.forDisplay())
      .where({ slug: params.slug })
      .highlightOrFail()

    const comments = await CommentService.getForPost(post)
    const series = await post.related('rootSeries').query()
      .wherePublic()
      .preload('posts', query => query.apply(scope => scope.forCollectionDisplay()))
      .preload('children', query => query
        .wherePublic()
        .preload('posts', query => query
          .apply(scope => scope.forCollectionDisplay())
          .if(auth.user, query => query.preload('progressionHistory', query => query.where('userId', auth.user!.id)))
        )
      )
      .first()

    this.historyService.recordPostView(post.id)
    const userProgression = await this.historyService.getPostProgression(post)

    return view.render('lessons/show', { post, series, comments, userProgression })
  }
}
