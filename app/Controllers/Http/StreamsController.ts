import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PostTypes from 'App/Enums/PostTypes'
import PostService from 'App/Services/PostService'
import Route from '@ioc:Adonis/Core/Route'
import { Exception } from '@adonisjs/core/build/standalone'
import HistoryService from 'App/Services/HistoryService'
import AnalyticsService from 'App/Services/AnalyticsService'
import CollectionService from 'App/Services/CollectionService'
import Collection from 'App/Models/Collection'
import Post from 'App/Models/Post'

export default class StreamsController {
  public async index({ request, view }: HttpContextContract) {
    const { page = 1, sortBy = 'publishAt', sort = 'desc' } = request.qs()
    const items = await PostService.getPaginated(page, 12, sortBy, sort, PostTypes.LIVESTREAM, Route.makeUrl('streams.index'))
    const live = await PostService.getActiveStream()

    return view.render('pages/streams/index', { items, live })
  }

  public async show({ request, view, params, auth, session, up, route }: HttpContextContract) {
    const post = route?.name?.startsWith('paths.') 
      ? await PostService.getBySlugForPath(params.slug, PostTypes.LIVESTREAM)
      : await PostService.getBySlug(params.slug, PostTypes.LIVESTREAM)

    let series: Collection | null = null
    let path: Collection | null = null
    let nextLesson: Post | undefined = undefined
    let prevLesson: Post | undefined = undefined

    if (params.collectionSlug && route?.name?.startsWith('paths.')) {
      path = await PostService.getPath(auth, post, params.collectionSlug)
      nextLesson = CollectionService.findNextPathLesson(path, post)
      prevLesson = CollectionService.findPrevPathLesson(path, post)
    } else {
      series = await PostService.getSeries(auth, post, params.collectionSlug)
      nextLesson = CollectionService.findNextSeriesLesson(series, post)
      prevLesson = CollectionService.findPrevSeriesLesson(series, post)
    }

    if (post.isNotViewable && !auth.user?.isAdmin) {
      throw new Exception('This post is not currently available to the public', 404)
    } else if (!post.isViewable && !auth.user?.isAdmin) {
      return view.render('pages/lessons/soon', { post, series })
    }

    const userProgression = await HistoryService.getPostProgression(auth.user, post)
    const comments = await PostService.getComments(post)
    const commentsCount = await PostService.getCommentsCount(post)
    const views = await AnalyticsService.getPageViews(request.url())

    const hasPlayerId = session.has('videoPlayerId')
    if (!hasPlayerId || (hasPlayerId && session.get('videoPlayerId') !== post.id)) {
      up.setTarget('[up-main], [up-player], [up-header]')
    }

    await HistoryService.recordView(auth.user, post, route?.name)

    session.put('videoPlayerId', post.id)
    view.share({
      player: { post, series, path, userProgression, nextLesson }
    })

    return view.render('pages/lessons/show', { post, series, path, comments, commentsCount, userProgression, views, nextLesson, prevLesson })
  }
}
