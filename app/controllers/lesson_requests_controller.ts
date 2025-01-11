import States from '#enums/states'
import LessonRequest from '#models/lesson_request'
import LessonRequestService from '#services/lesson_request_service'
import logger from '#services/logger_service'
import MentionService from '#services/mention_service'
import NotificationService from '#services/notification_service'
import {
  lessonRequestSearchValidator,
  lessonRequestStoreValidator,
  lessonRequestUpdateValidator,
} from '#validators/lesson_request_validator'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'
import db from '@adonisjs/lucid/services/db'

@inject()
export default class LessonRequestsController {
  constructor(protected lessonRequestService: LessonRequestService) {}

  async index({ view, request }: HttpContext) {
    const lessonRequests = await this.lessonRequestService.getPaginatedList(request.qs())

    return view.render('pages/requests/lessons/index', { lessonRequests })
  }

  async show({ params, view }: HttpContext) {
    const lessonRequest = await this.lessonRequestService.get(params.id)
    const comments = await this.lessonRequestService.getComments(lessonRequest)
    const commentsCount = await this.lessonRequestService.getCommentsCount(lessonRequest)

    return view.render('pages/requests/lessons/show', { lessonRequest, comments, commentsCount })
  }

  async create({ view, bouncer }: HttpContext) {
    await bouncer.with('LessonRequestPolicy').authorize('store')

    return view.render('pages/requests/lessons/create')
  }

  async store({ request, response, auth, session, bouncer }: HttpContext) {
    await bouncer.with('LessonRequestPolicy').authorize('store')
    const trx = await db.transaction()

    try {
      const data = await request.validateUsing(lessonRequestStoreValidator)
      const lessonRequest = await this.lessonRequestService.store(auth.user!, data, trx)

      await MentionService.checkForLessonRequestMention(lessonRequest, auth.user!, [], trx)
      await trx.commit()
      await logger.info('NEW LESSON REQUEST', { id: lessonRequest.id, name: lessonRequest.name })

      session.flash('success', 'Your request has been submitted')

      return response.redirect().toRoute('requests.lessons.show', { id: lessonRequest.id })
    } catch (error) {
      await trx.rollback()
      await logger.error('LessonRequestController:store', error)
      session.flash('error', 'Something went wrong. Please try again later.')
      return response.redirect().back()
    }
  }

  async edit({ view, params, bouncer }: HttpContext) {
    const lessonRequest = await this.lessonRequestService.get(params.id)

    await bouncer.with('LessonRequestPolicy').authorize('update', lessonRequest)

    return view.render('pages/requests/lessons/edit', { lessonRequest })
  }

  async update({ request, response, auth, params, session, bouncer }: HttpContext) {
    const lessonRequest = await this.lessonRequestService.get(params.id)

    await bouncer.with('LessonRequestPolicy').authorize('update', lessonRequest)

    const data = await request.validateUsing(lessonRequestUpdateValidator)
    const trx = await db.transaction()

    try {
      lessonRequest.useTransaction(trx)

      const oldBody = lessonRequest.body
      let stateId = lessonRequest.stateId

      if (stateId === States.IN_PROGRESS) {
        stateId = States.IN_REVIEW
      }

      await lessonRequest.merge({ ...data, stateId }).save()

      const newMentions = await MentionService.checkTextForNewMentions(oldBody, lessonRequest.body)

      if (newMentions.length) {
        await NotificationService.onLessonRequestMention(
          lessonRequest,
          newMentions,
          auth.user!,
          [],
          trx
        )
      }

      await trx.commit()

      session.flash('success', 'Your request has been updated')

      return response.redirect().toRoute('requests.lessons.show', { id: lessonRequest.id })
    } catch (error) {
      await trx.rollback()
      await logger.error('LessonRequestController:update', error)
      session.flash('error', 'Something went wrong. Please try again later.')
      return response.redirect().back()
    }
  }

  async destroy({ response, params, session, bouncer }: HttpContext) {
    const lessonRequest = await this.lessonRequestService.get(params.id)

    await bouncer.with('LessonRequestPolicy').authorize('delete', lessonRequest)

    await lessonRequest
      .merge({
        name: '[deleted]',
        body: '[deleted]',
        stateId: States.ARCHIVED,
      })
      .save()

    session.flash('success', 'Your request has been successfully deleted')

    return response.redirect().toRoute('requests.lessons.index')
  }

  async search({ view, request, response }: HttpContext) {
    const data = await request.validateUsing(lessonRequestSearchValidator)
    const lessonRequests = await this.lessonRequestService.search(data)
    const newPath = router.makeUrl('requests.lessons.index', {}, { qs: data })

    response.header('X-Up-Location', newPath)

    return view.render('components/request/list', { lessonRequests })
  }

  async vote({ view, auth, params, bouncer }: HttpContext) {
    await bouncer.with('LessonRequestPolicy').authorize('vote')

    const lessonRequest = await this.lessonRequestService.toggleVote(auth.user!, params.id)

    return view.render('components/request/vote', { lessonRequest })
  }

  async approve({ response, params, bouncer }: HttpContext) {
    const lessonRequest = await LessonRequest.findOrFail(params.id)

    await bouncer.with('LessonRequestPolicy').authorize('approve', lessonRequest)

    await this.lessonRequestService.approve(lessonRequest)

    return response.redirect().back()
  }

  async reject({ response, params, bouncer }: HttpContext) {
    const lessonRequest = await LessonRequest.findOrFail(params.id)

    await bouncer.with('LessonRequestPolicy').authorize('reject', lessonRequest)

    await this.lessonRequestService.reject(lessonRequest)

    return response.redirect().back()
  }

  async complete({ response, params, bouncer }: HttpContext) {
    const lessonRequest = await LessonRequest.findOrFail(params.id)

    await bouncer.with('LessonRequestPolicy').authorize('complete', lessonRequest)

    await this.lessonRequestService.complete(lessonRequest)

    return response.redirect().back()
  }

  async fragment({ view, params }: HttpContext) {
    const lessonRequest = await LessonRequest.findOrFail(params.id)

    return view.render(`components/request/${params.fragment}`, { lessonRequest })
  }
}

