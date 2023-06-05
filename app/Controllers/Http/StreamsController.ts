import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PostTypes from 'App/Enums/PostTypes'
import PostService from 'App/Services/PostService'
import Route from '@ioc:Adonis/Core/Route'
import { Exception } from '@adonisjs/core/build/standalone'
import HistoryService from 'App/Services/HistoryService'
import AnalyticsService from 'App/Services/AnalyticsService'
import CollectionService from 'App/Services/CollectionService'

export default class StreamsController {
  public async index({ request, view }: HttpContextContract) {
    const { page = 1, sortBy = 'publishAt', sort = 'desc' } = request.qs()
    const items = await PostService.getPaginated(page, 12, sortBy, sort, PostTypes.LIVESTREAM, Route.makeUrl('streams.index'))
    const live = await PostService.getActiveStream()

    return view.render('pages/streams/index', { items, live })
  }

  public async show({ request, view, params, auth, session, up, route }: HttpContextContract) {
    const post = await PostService.getBySlug(params.slug, PostTypes.LIVESTREAM)
    const series = await PostService.getSeries(auth, post)

    if (post.isNotViewable && !auth.user?.isAdmin) {
      throw new Exception('This post is not currently available to the public', 404)
    } else if (!post.isViewable && !auth.user?.isAdmin) {
      return view.render('pages/lessons/soon', { post, series })
    }

    const userProgression = await HistoryService.getPostProgression(auth, post)
    const comments = await PostService.getComments(post)
    const commentsCount = await PostService.getCommentsCount(post)
    const views = await AnalyticsService.getPageViews(request.url())
    const nextSeriesLesson = CollectionService.findNextSeriesLesson(series, post)
    const prevSeriesLesson = CollectionService.findPrevSeriesLesson(series, post)

    const hasPlayerId = session.has('videoPlayerId')
    if (!hasPlayerId || (hasPlayerId && session.get('videoPlayerId') !== post.id)) {
      up.setTarget('[up-main], [up-player], [up-header]')
    }

    await HistoryService.recordView(auth.user, post, route?.name)

    session.put('videoPlayerId', post.id)
    view.share({
      player: { post, series, userProgression }
    })

    return view.render('pages/lessons/show', { post, series, comments, commentsCount, userProgression, views, nextSeriesLesson, prevSeriesLesson })
  }
}
