import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PostTypes from 'App/Enums/PostTypes'
import PostService from 'App/Services/PostService'
import Route from '@ioc:Adonis/Core/Route'
import { Exception } from '@adonisjs/core/build/standalone'
import AnalyticsService from 'App/Services/AnalyticsService'
import HistoryService from 'App/Services/HistoryService'
import CollectionService from 'App/Services/CollectionService'
import Event from '@ioc:Adonis/Core/Event'

export default class LessonsController {
  public async index({ request, view }: HttpContextContract) {
    const { page = 1, sortBy = 'publishAt', sort = 'desc' } = request.qs()
    const items = await PostService.getPaginated(page, 12, sortBy, sort, PostTypes.LESSON, Route.makeUrl('lessons.index'))

    return view.render('pages/lessons/index', { items })
  }

  public async show({ request, params, view, auth, session, route, up }: HttpContextContract) {
    const post = await PostService.getBySlug(params.slug, PostTypes.LESSON)
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
    if (!up.isUnpolyRequest || !hasPlayerId || (hasPlayerId && session.get('videoPlayerId') !== post.id)) {
      up.setTarget('[up-main], [up-player], [up-header]')
    }

    await HistoryService.recordView(auth.user, post, route?.name)

    session.put('videoPlayerId', post.id)
    view.share({
      player: { post, series, userProgression }
    })

    Event.emit('post:sync', { post, views })

    return view.render('pages/lessons/show', { post, series, comments, commentsCount, userProgression, views, nextSeriesLesson, prevSeriesLesson })
  }
}
