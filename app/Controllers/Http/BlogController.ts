import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PostTypes from 'App/Enums/PostTypes'
import PostService from 'App/Services/PostService'
import Route from '@ioc:Adonis/Core/Route'
import HistoryService from 'App/Services/HistoryService'
import AnalyticsService from 'App/Services/AnalyticsService'
import { Exception } from '@adonisjs/core/build/standalone'

export default class BlogController {
  public async index({ request, view }: HttpContextContract) {
    let postTypeIds: PostTypes|PostTypes[] = [PostTypes.NEWS, PostTypes.BLOG, PostTypes.LINK]
    let filteredTo = ''

    if (request.qs().type) {
      switch (request.qs().type) {
        case 'news':
          postTypeIds = PostTypes.NEWS
          filteredTo = 'news'
          break
        case 'blog':
          postTypeIds = PostTypes.BLOG
          filteredTo = 'blog'
          break
        case 'link':
          postTypeIds = PostTypes.LINK
          filteredTo = 'link'
      }
    }

    const { page = 1, sortBy = 'publishAt', sort = 'desc' } = request.qs()
    const items = await PostService.getPaginated(page, 12, sortBy, sort, postTypeIds, Route.makeUrl('news.index'))

    return view.render('pages/blog/index', { items, filteredTo })
  }

  public async show({ request, view, params, auth, session, up, route }: HttpContextContract) {
    const post = await PostService.getBySlug(params.slug, [PostTypes.BLOG, PostTypes.NEWS])

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
