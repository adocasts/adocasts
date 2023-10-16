import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PostTypes from 'App/Enums/PostTypes'
import PostService from 'App/Services/PostService'
import HistoryService from 'App/Services/HistoryService'
import AnalyticsService from 'App/Services/AnalyticsService'
import { Exception } from '@adonisjs/core/build/standalone'

export default class NewsController {
  public async index({ response }: HttpContextContract) {
    return response.redirect().toRoute('blog.index')
  }

  public async show({ request, view, params, auth, session, up, route }: HttpContextContract) {
    const post = await PostService.getBySlug(params.slug, PostTypes.NEWS)

    if (post.isNotViewable && !auth.user?.isAdmin && !post.authors.some(a => a.id === auth.user?.id)) {
      throw new Exception('This post is not currently available to the public', 404)
    }

    const comments = await PostService.getComments(post)
    const commentsCount = await PostService.getCommentsCount(post)
    const views = await AnalyticsService.getPageViews(request.url())

    const hasPlayerId = session.has('videoPlayerId')
    if (!hasPlayerId || (hasPlayerId && session.get('videoPlayerId') !== post.id)) {
      up.setTarget('[up-main], [up-player]')
    }

    await HistoryService.recordView(auth.user, post, route?.name)

    session.put('videoPlayerId', post.id)
    view.share({
      player: { post }
    })

    return view.render('pages/lessons/show', { post, comments, commentsCount, views })
  }
}
