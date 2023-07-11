import { Exception } from '@adonisjs/core/build/standalone'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PostTypes from 'App/Enums/PostTypes'
import Post from 'App/Models/Post'
import AnalyticsService from 'App/Services/AnalyticsService'
import HistoryService from 'App/Services/HistoryService'
import PostService from 'App/Services/PostService'

export default class SnippetsController {
  public async index({ view }: HttpContextContract) {
    const snippets = await Post.snippets().apply(s => s.forDisplay()).orderBy('publishAt', 'desc')

    return view.render('pages/snippets/index', { snippets })
  }

  public async show({ view, request, session, auth, params, route, up }: HttpContextContract) {
    const post = await PostService.getBySlug(params.slug, PostTypes.SNIPPET)

    if (post.isNotViewable && !auth.user?.isAdmin) {
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
