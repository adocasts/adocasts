import ProgressService from '#services/progress_service'
import { progressValidator } from '#validators/history_validator'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class ProgressionsController {
  constructor(protected progressService: ProgressService) {}

  async toggle({ view, request }: HttpContext) {
    const data = await request.validateUsing(progressValidator)
    const userProgression = await this.progressService.toggleComplete(data)

    return view.render('components/post/completed', { userProgression, rerender: true })
  }

  async record({ request, response, auth }: HttpContext) {
    if (!auth.user) return

    const data = await request.validateUsing(progressValidator)
    const progression = await this.progressService.recordProgression(data)

    return response.json({ success: true, progression })
  }
}
