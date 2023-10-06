import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import HistoryService from 'App/Services/HistoryService'
import HistoryValidator from 'App/Validators/HistoryValidator'

export default class ProgressionsController {
  public async toggle({ request, view, auth, route }: HttpContextContract) {
    const data = await request.validate(HistoryValidator)
    const userProgression = await HistoryService.toggleComplete(auth.user!, route?.name, data)

    return view.render('components/fragments/complete', { userProgression })
  }

  public async record({ request, response, route, auth }) {
    if (!auth.user) return 
    
    const data = await request.validate(HistoryValidator)
    const progression = await HistoryService.recordProgression(auth.user!, route.routeName, data)

    return response.json({ success: true, progression })
  }
}
