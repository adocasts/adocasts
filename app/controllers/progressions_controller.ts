import HistoryService from '#services/history_service'
import { historyValidator } from '#validators/history_validator'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class ProgressionsController {
  constructor(protected historyService: HistoryService) {}

  async toggle({ view, request }: HttpContext) {
    const data = await request.validateUsing(historyValidator)
    const userProgression = await this.historyService.toggleComplete(data)

    return view.render('components/post/completed', { userProgression, rerender: true })
  }

  async record({ request, response, auth }: HttpContext) {
    if (!auth.user) return

    const data = await request.validateUsing(historyValidator)
    const progression = await this.historyService.recordProgression(data)

    return response.json({ success: true, progression })
  }
}
