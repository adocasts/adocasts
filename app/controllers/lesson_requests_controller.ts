import States from '#enums/states'
import LessonRequest from '#models/lesson_request'
import LessonRequestService from '#services/lesson_request_service'
import { lessonRequestSearchValidator, lessonRequestStoreValidator, lessonRequestUpdateValidator } from '#validators/lesson_request_validator'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'

@inject()
export default class LessonRequestsController {
  constructor(protected lessonRequestService: LessonRequestService) {}

  public async index({ view, request }: HttpContext) {
    const lessonRequests = await this.lessonRequestService.getPaginatedList(request.qs())

    return view.render('pages/requests/lessons/index', { lessonRequests })
  }

  public async show({ params, view }: HttpContext) {
    const lessonRequest = await this.lessonRequestService.get(params.id)
    const comments = await this.lessonRequestService.getComments(lessonRequest)
    const commentsCount = await this.lessonRequestService.getCommentsCount(lessonRequest)

    return view.render('pages/requests/lessons/show', { lessonRequest, comments, commentsCount })
  }

  public async create({ view, bouncer }: HttpContext) {
    await bouncer.with('LessonRequestPolicy').authorize('store')

    return view.render('pages/requests/lessons/create')
  }

  public async store({ request, response, auth, session, bouncer }: HttpContext) {
    await bouncer.with('LessonRequestPolicy').authorize('store')

    const data = await request.validateUsing(lessonRequestStoreValidator)
    const lessonRequest = await this.lessonRequestService.store(auth.user!, data)

    session.flash('success', 'Your request has been submitted')

    return response.redirect().toRoute('requests.lessons.show', { id: lessonRequest.id })
  }

  public async edit({ view, params, bouncer }: HttpContext) {
    const lessonRequest = await this.lessonRequestService.get(params.id)
    
    await bouncer.with('LessonRequestPolicy').authorize('update', lessonRequest)

    return view.render('pages/requests/lessons/edit', { lessonRequest })
  }

  public async update({ request, response, params, session, bouncer }: HttpContext) {
    const lessonRequest = await this.lessonRequestService.get(params.id)

    await bouncer.with('LessonRequestPolicy').authorize('update', lessonRequest)

    const data = await request.validateUsing(lessonRequestUpdateValidator)
    let stateId = lessonRequest.stateId

    if (stateId === States.IN_PROGRESS) {
      stateId = States.IN_REVIEW
    }

    await lessonRequest.merge({ ...data, stateId }).save()
  
    session.flash('success', 'Your request has been updated')

    return response.redirect().toRoute('requests.lessons.show', { id: lessonRequest.id })
  }

  public async destroy({ response, params, session, bouncer }: HttpContext) {
    const lessonRequest = await this.lessonRequestService.get(params.id)

    await bouncer.with('LessonRequestPolicy').authorize('delete', lessonRequest)

    await lessonRequest.merge({ 
      name: '[deleted]',
      body: '[deleted]',
      stateId: States.ARCHIVED 
    }).save()

    session.flash('success', 'Your request has been successfully deleted')

    return response.redirect().toRoute('requests.lessons.index')
  }

  public async search({ view, request, response }: HttpContext) {
    const data = await request.validateUsing(lessonRequestSearchValidator)
    const lessonRequests = await this.lessonRequestService.search(data)
    const newPath = router.makeUrl('requests.lessons.index', {}, { qs: data })

    response.header('X-Up-Location', newPath)
    
    return view.render('components/request/list', { lessonRequests })
  }

  public async vote({ view, auth, params, bouncer }: HttpContext) {
    await bouncer.with('LessonRequestPolicy').authorize('vote')

    const lessonRequest = await this.lessonRequestService.toggleVote(auth.user!, params.id)

    return view.render('components/request/vote', { lessonRequest })
  }

  public async approve({ response, params, bouncer }: HttpContext) {
    const lessonRequest = await LessonRequest.findOrFail(params.id)

    await bouncer.with('LessonRequestPolicy').authorize('approve', lessonRequest)

    await this.lessonRequestService.approve(lessonRequest)

    return response.redirect().back()
  }

  public async reject({ response, params, bouncer }: HttpContext) {
    const lessonRequest = await LessonRequest.findOrFail(params.id)

    await bouncer.with('LessonRequestPolicy').authorize('reject', lessonRequest)

    await this.lessonRequestService.reject(lessonRequest)

    return response.redirect().back()
  }

  public async complete({ response, params, bouncer }: HttpContext) {
    const lessonRequest = await LessonRequest.findOrFail(params.id)

    await bouncer.with('LessonRequestPolicy').authorize('complete', lessonRequest)

    await this.lessonRequestService.complete(lessonRequest)

    return response.redirect().back()
  }

  public async fragment({ view, params }: HttpContext) {
    const lessonRequest = await LessonRequest.findOrFail(params.id)

    return view.render(`components/request/${params.fragment}`, { lessonRequest })
  }
}