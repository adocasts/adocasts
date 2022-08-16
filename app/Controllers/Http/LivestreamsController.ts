import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { inject } from '@adonisjs/fold'
import HistoryService from 'App/Services/Http/HistoryService'
import Post from 'App/Models/Post'
import Route from '@ioc:Adonis/Core/Route'
import Role from 'App/Enums/Roles'
import { Exception } from '@adonisjs/core/build/standalone'
import CommentService from 'App/Services/CommentService'
import CollectionService from 'App/Services/CollectionService'

@inject()
export default class LivestreamsController {
  constructor(protected historyService: HistoryService) {}

  public async index ({ view, request }: HttpContextContract) {
    const { page = 1, sortBy = 'publishAt', sort = 'desc' } = request.qs()

    const live = await Post.livestreams()
      .apply(scope => scope.forDisplay())
      .whereTrue('isLive')
      .whereNotNull('livestreamUrl')
      .orderBy('publishAt', 'desc')
      .first()

    const items = await Post.livestreams()
      .apply(scope => scope.forDisplay())
      .orderBy(sortBy, sort)
      .paginate(page, 12)

    items.baseUrl(Route.makeUrl('livestreams.index'))

    return view.render('livestreams/index', { live, items })
  }

  public async show({ view, params, auth }: HttpContextContract) {
    const post = await Post.livestreams()
      .apply(scope => scope.forDisplay(true))
      .where({ slug: params.slug })
      .highlightOrFail()

    if (!post.isViewable && auth.user?.roleId !== Role.ADMIN) {
      throw new Exception('This post is not currently available to the public', 404)
    }

    const comments = await CommentService.getForPost(post)
    const series = await CollectionService.getSeriesForPost(post, auth.user?.id)

    this.historyService.recordPostView(post.id)
    const userProgression = await this.historyService.getPostProgression(post)

    return view.render('lessons/show', { post, comments, series, userProgression })
  }
}
