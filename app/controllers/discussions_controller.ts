import DiscussionViewTypes from '#enums/discussion_view_types'
import Discussion from '#models/discussion'
import DiscussionService from '#services/discussion_service'
import logger from '#services/logger_service'
import MentionService from '#services/mention_service'
import NotificationService from '#services/notification_service'
import SessionService from '#services/session_service'
import { discussionCreateValidator, discussionSearchValidator } from '#validators/discussion_validator'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

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

  public async store({ request, response, auth, session, bouncer }: HttpContext) {
    await bouncer.with('DiscussionPolicy').authorize('store')
    const trx = await db.transaction()

    try {
      const data = await request.validateUsing(discussionCreateValidator)
      const discussion = await auth.user!.related('discussions').create(data, { client: trx })

      await MentionService.checkForDiscussionMention(discussion, auth.user!, trx)
      await trx.commit()

      return response.redirect().toRoute('feed.show', { slug: discussion.slug })
    } catch (error) {
      await trx.rollback()
      await logger.error('DiscussionController:store', error)
      session.flash('error', 'Something went wrong. Please try again later.')
      return response.redirect().back()
    }
  }

  @inject()
  public async show({ view, params, auth }: HttpContext, sessionService: SessionService) {
    const item = await this.discussionService.getBySlug(params.slug)
    const comments = await this.discussionService.getComments(item)
    const commentCount = item.$extras.commentsCount

    const data = {
      typeId: DiscussionViewTypes.VIEW,
      ipAddress: sessionService.ipAddress,
      userAgent: sessionService.userAgent,
    }
    
    await item.related('views').create({
      ...data,
      userId: auth.user?.id
    })

    return view.render('pages/discussions/show', { item, comments, commentCount })
  }

  public async edit({ view, params, bouncer }: HttpContext) {
    const item = await Discussion.findByOrFail('slug', params.slug)
    const topics = await this.discussionService.getTopics()

    await bouncer.with('DiscussionPolicy').authorize('update', item)

    return view.render('pages/discussions/edit', { item, topics })
  }

  public async update({ request, response, params, session, auth, bouncer }: HttpContext) {
    const item = await Discussion.findOrFail(params.id)

    await bouncer.with('DiscussionPolicy').authorize('update', item)
    const trx = await db.transaction()

    try {
      item.useTransaction(trx) 
      
      const data = await request.validateUsing(discussionCreateValidator)
      const oldBody = item.body

      await item.merge(data).save()

      const newMentions = MentionService.checkTextForNewMentions(oldBody, item.body)

      if (newMentions.length) {
        await NotificationService.onDiscussionMention(item, newMentions, auth.user!, trx)
      }

      await trx.commit()

      return response.redirect().toRoute('feed.show', { slug: item.slug })
    } catch (error) {
      await trx.rollback()
      await logger.error(`DiscussionController:update@${item.id}`, error)
      session.flash('error', 'Something went wrong. Please try again later.')
      return response.redirect().back()
    }
  }

  public async destroy({ response, params, bouncer }: HttpContext) {
    const item = await Discussion.findOrFail(params.id)
    
    await bouncer.with('DiscussionPolicy').authorize('delete', item)
    await item.delete()

    return response.redirect().toRoute('feed.index')
  }

  @inject()
  public async impression({ response, params, auth }: HttpContext, sessionService: SessionService) {
    const item = await Discussion.query()
      .where('id', params.id)
      .preload('impressions', query => query
        .where('ipAddress', sessionService.ipAddress!)
        .where('userAgent', sessionService.userAgent!)
        .where('createdAt', '>=', DateTime.now().minus({ seconds: 30 }).toSQL())
        .orderBy('createdAt', 'desc')
        .groupLimit(1)
      )
      .firstOrFail()

    // if user provided impression in the past 1 min, do nothing
    if (item.impressions.length) {
      return response.status(204)
    }

    await item.related('views').create({
      userId: auth.user?.id,
      typeId: DiscussionViewTypes.IMPRESSION,
      ipAddress: sessionService.ipAddress,
      userAgent: sessionService.userAgent
    })

    return response.status(204)
  }

  public async vote({ view, auth, params, bouncer }: HttpContext) {
    await bouncer.with('DiscussionPolicy').authorize('vote')

    const discussion = await this.discussionService.toggleVote(auth.user!, params.id)
    
    return view.render('components/discussion/vote', { item: discussion })
  }
}