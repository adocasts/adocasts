import States from '#enums/states'
import Discussion from '#models/discussion'
import Taxonomy from '#models/taxonomy'
import { discussionCreateValidator } from '#validators/discussion_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class DiscussionsController {
  public async index({ view, request }: HttpContext) {
    const { page = 1 } = request.qs()
    const items = await Discussion.query()
      .preload('user', query => query.preload('profile'))
      .preload('taxonomy', query => query.preload('asset'))
      .where('stateId', States.PUBLIC)
      .withCount('comments', query => query.where('stateId', States.PUBLIC).as('commentCount'))
      .preload('comments', query => query.preload('user').where('stateId', States.PUBLIC).orderBy('createdAt', 'desc').groupLimit(2))
      .orderBy('createdAt', 'desc')
      .paginate(page, 20)

    const topics = await Taxonomy.query().orderBy('name').select('id', 'name')

    return view.render('pages/discussions/index', { items, topics })
  }

  public async create({ view }: HttpContext) {
    const topics = await Taxonomy.query().orderBy('name').select('id', 'name')
    return view.render('pages/discussions/create', { topics })
  }

  public async store({ request, response, auth }: HttpContext) {
    const data = await request.validateUsing(discussionCreateValidator)
    const discussion = await auth.user!.related('discussions').create(data)

    return response.redirect().toRoute('feed.show', { slug: discussion.slug })
  }

  public async show({ view, params }: HttpContext) {
    const item = await Discussion.query()
      .preload('user', query => query.preload('profile'))
      .preload('taxonomy', query => query.preload('asset'))
      .withCount('comments', query => query.where('stateId', States.PUBLIC).as('commentsCount'))
      .where('slug', params.slug)
      .where('stateId', States.PUBLIC)
      .firstOrFail()

    const comments = await item.related('comments').query()
      .withCount('userVotes', query => query.as('voteCount'))
      .where('stateId', States.PUBLIC)
      .orderBy([
        { column: 'voteCount', order: 'desc' },
        { column: 'createdAt', order: 'asc' },
      ])
      .preload('user')
      .preload('userVotes', query => query.select('id'))

    const commentCount = item.$extras.commentsCount

    return view.render('pages/discussions/show', { item, comments, commentCount })
  }

  public async edit({ view, params }: HttpContext) {
    const item = await Discussion.findByOrFail('slug', params.slug)
    const topics = await Taxonomy.query().orderBy('name').select('id', 'name')

    return view.render('pages/discussions/edit', { item, topics })
  }

  public async update({ request, response, params }: HttpContext) {
    const item = await Discussion.findOrFail(params.id)
    const data = await request.validateUsing(discussionCreateValidator)

    await item.merge(data).save()

    return response.redirect().toRoute('feed.show', { slug: item.slug })
  }

  public async destroy({ response, params }: HttpContext) {
    const item = await Discussion.findOrFail(params.id)

    await item.delete()

    return response.redirect().toRoute('feed.index')
  }
}