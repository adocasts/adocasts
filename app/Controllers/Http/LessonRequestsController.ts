import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LessonRequest from 'App/Models/LessonRequest'
import LessonRequestService from 'App/Services/LessonRequestService'
import LessonRequestSearchValidator from 'App/Validators/LessonRequestSearchValidator'
import LessonRequestStoreValidator from 'App/Validators/LessonRequestStoreValidator'
import Route from '@ioc:Adonis/Core/Route'
import LessonRequestUpdateValidator from 'App/Validators/LessonRequestUpdateValidator'
import States from 'App/Enums/States'

export default class LessonRequestsController {
  public async index({ view, request }: HttpContextContract) {
    const lessonRequests = await LessonRequestService.getPaginatedList(request.qs())

    return view.render('pages/requests/lessons/index', { lessonRequests })
  }

  public async show({ params, view }: HttpContextContract) {
    const lessonRequest = await LessonRequestService.get(params.id)
    const comments = await LessonRequestService.getComments(lessonRequest)
    const commentsCount = await LessonRequestService.getCommentsCount(lessonRequest)

    return view.render('pages/requests/lessons/show', { lessonRequest, comments, commentsCount })
  }

  public async create({ view, bouncer }: HttpContextContract) {
    await bouncer.with('LessonRequestPolicy').authorize('store')

    return view.render('pages/requests/lessons/create')
  }

  public async store({ request, response, auth, session, bouncer }: HttpContextContract) {
    await bouncer.with('LessonRequestPolicy').authorize('store')

    const data = await request.validate(LessonRequestStoreValidator)
    const lessonRequest = await LessonRequestService.store(auth.user!, data)

    session.flash('success', 'Your request has been submitted')

    return response.redirect().toRoute('requests.lessons.show', { id: lessonRequest.id })
  }

  public async edit({ view, params, bouncer }: HttpContextContract) {
    const lessonRequest = await LessonRequestService.get(params.id)
    
    await bouncer.with('LessonRequestPolicy').authorize('update', lessonRequest)

    return view.render('pages/requests/lessons/edit', { lessonRequest })
  }

  public async update({ request, response, params, session, bouncer }: HttpContextContract) {
    const lessonRequest = await LessonRequestService.get(params.id)

    await bouncer.with('LessonRequestPolicy').authorize('update', lessonRequest)

    const data = await request.validate(LessonRequestUpdateValidator)
    let stateId = lessonRequest.stateId

    if (stateId === States.IN_PROGRESS) {
      stateId = States.IN_REVIEW
    }

    await lessonRequest.merge({ ...data, stateId }).save()
  
    session.flash('success', 'Your request has been updated')

    return response.redirect().toRoute('requests.lessons.show', { id: lessonRequest.id })
  }

  public async destroy({ response, params, session, bouncer }: HttpContextContract) {
    const lessonRequest = await LessonRequestService.get(params.id)

    await bouncer.with('LessonRequestPolicy').authorize('delete', lessonRequest)

    await lessonRequest.merge({ 
      name: '[deleted]',
      body: '[deleted]',
      stateId: States.ARCHIVED 
    }).save()

    session.flash('success', 'Your request has been successfully deleted')

    return response.redirect().toRoute('requests.lessons.index')
  }

  public async search({ view, request, response }: HttpContextContract) {
    const data = await request.validate(LessonRequestSearchValidator)
    const lessonRequests = await LessonRequestService.search(data)
    const newPath = Route.makeUrl('requests.lessons.index', {}, { qs: data })

    response.header('X-Up-Location', newPath)
    
    return view.render('components/lessons/request-list', { lessonRequests })
  }

  public async vote({ view, auth, params, bouncer }: HttpContextContract) {
    await bouncer.with('LessonRequestPolicy').authorize('vote')

    const lessonRequest = await LessonRequestService.toggleVote(auth.user!, params.id)

    return view.render('components/fragments/request-vote', { lessonRequest })
  }

  public async approve({ request, response, auth, params, bouncer }: HttpContextContract) {
    const lessonRequest = await LessonRequest.findOrFail(params.id)

    await bouncer.with('LessonRequestPolicy').authorize('approve', lessonRequest)

    await LessonRequestService.approve(request, auth.user!, lessonRequest)

    return response.redirect().back()
  }

  public async reject({ request, response, auth, params, bouncer }: HttpContextContract) {
    const lessonRequest = await LessonRequest.findOrFail(params.id)

    await bouncer.with('LessonRequestPolicy').authorize('reject', lessonRequest)

    await LessonRequestService.reject(request, auth.user!, lessonRequest)

    return response.redirect().back()
  }

  public async complete({ request, response, auth, params, bouncer }: HttpContextContract) {
    const lessonRequest = await LessonRequest.findOrFail(params.id)

    await bouncer.with('LessonRequestPolicy').authorize('complete', lessonRequest)

    await LessonRequestService.complete(request, auth.user!, lessonRequest)

    return response.redirect().back()
  }

  public async fragment({ view, params }: HttpContextContract) {
    const lessonRequest = await LessonRequest.findOrFail(params.id)

    return view.render(`components/fragments/${params.fragment}`, { lessonRequest })
  }
}
