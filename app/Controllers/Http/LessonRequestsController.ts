import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LessonRequest from 'App/Models/LessonRequest'
import LessonRequestService from 'App/Services/LessonRequestService'
import LessonRequestStoreValidator from 'App/Validators/LessonRequestStoreValidator'

export default class LessonRequestsController {
  public async index({ view }: HttpContextContract) {
    const lessonRequests = await LessonRequestService.getList()

    return view.render('pages/requests/lessons/index', { lessonRequests })
  }

  public async show({ params, view }: HttpContextContract) {
    const lessonRequest = await LessonRequest.findOrFail(params.id)

    await lessonRequest.load('user')
    await lessonRequest.load('votes', query => query.selectIds())
    await lessonRequest.loadCount('votes')

    return view.render('pages/requests/lessons/show', { lessonRequest })
  }

  public async create({ view }: HttpContextContract) {
    return view.render('pages/requests/lessons/create')
  }

  public async store({ request, response, auth }: HttpContextContract) {
    const data = await request.validate(LessonRequestStoreValidator)
    const lessonRequest = await LessonRequestService.store(auth.user!, data)

    return response.redirect().toRoute('requests.lessons.show', { id: lessonRequest.id })
  }

  public async vote({ view, auth, params }: HttpContextContract) {
    const lessonRequest = await LessonRequestService.toggleVote(auth.user!, params.id)

    return view.render('components/fragments/request-vote', { lessonRequest })
  }
}
