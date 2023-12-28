import Discussion from '#models/discussion'
import DiscussionService from '#services/discussion_service'
import { discussionCreateValidator, discussionSearchValidator } from '#validators/discussion_validator'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'

@inject()
export default class DiscussionsController {
  constructor(protected discussionService: DiscussionService) {}

  public async index({ view, request }: HttpContext) {
    const items = await this.discussionService.getPaginated(request.qs())
    const topics = await this.discussionService.getTopics()

    return view.render('pages/discussions/index', { items, topics })
  }

  public async search({ view, request, up }: HttpContext) {
    const data = await request.validateUsing(discussionSearchValidator)
    const items = await this.discussionService.getPaginated(data)
    const newPath = router.makeUrl('feed.index', {}, { qs: data })

    up.setLocation(newPath)
    up.setMethod('GET')
    
    return view.render('components/discussion/list', { items })
  }

  public async create({ view, bouncer }: HttpContext) {
    await bouncer.with('DiscussionPolicy').authorize('store')

    const topics = await this.discussionService.getTopics()
    return view.render('pages/discussions/create', { topics })
  }

  public async store({ request, response, auth, bouncer }: HttpContext) {
    await bouncer.with('DiscussionPolicy').authorize('store')

    const data = await request.validateUsing(discussionCreateValidator)
    const discussion = await auth.user!.related('discussions').create(data)

    return response.redirect().toRoute('feed.show', { slug: discussion.slug })
  }

  public async show({ view, params }: HttpContext) {
    const item = await this.discussionService.getBySlug(params.slug)
    const comments = await this.discussionService.getComments(item)
    const commentCount = item.$extras.commentsCount

    return view.render('pages/discussions/show', { item, comments, commentCount })
  }

  public async edit({ view, params, bouncer }: HttpContext) {
    const item = await Discussion.findByOrFail('slug', params.slug)
    const topics = await this.discussionService.getTopics()

    await bouncer.with('DiscussionPolicy').authorize('update', item)

    return view.render('pages/discussions/edit', { item, topics })
  }

  public async update({ request, response, params, bouncer }: HttpContext) {
    const item = await Discussion.findOrFail(params.id)

    await bouncer.with('DiscussionPolicy').authorize('update', item)

    const data = await request.validateUsing(discussionCreateValidator)

    await item.merge(data).save()

    return response.redirect().toRoute('feed.show', { slug: item.slug })
  }

  public async destroy({ response, params, bouncer }: HttpContext) {
    const item = await Discussion.findOrFail(params.id)
    
    await bouncer.with('DiscussionPolicy').authorize('delete', item)
    await item.delete()

    return response.redirect().toRoute('feed.index')
  }

  public async vote({ view, auth, params, bouncer }: HttpContext) {
    await bouncer.with('DiscussionPolicy').authorize('vote')

    const discussion = await this.discussionService.toggleVote(auth.user!, params.id)
    
    return view.render('components/discussion/vote', { item: discussion })
  }
}