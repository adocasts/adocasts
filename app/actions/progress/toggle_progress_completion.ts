import BaseAction from '#actions/base_action'
import { progressValidator } from '#validators/history'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'
import GetOrCreateProgress from './get_or_create_progress.js'
import Progress from '#models/progress'

type Validator = Infer<typeof progressValidator>

export default class ToggleProgressCompletion extends BaseAction<[number, Validator]> {
  validator = progressValidator

  async asController({ view, auth }: HttpContext, data: Validator) {
    const progress = await this.handle(auth.user!.id, data)

    return view.render('components/frags/lesson/completed_toggle', { progress })
  }

  async handle(userId: number, data: Validator) {
    const progress = await GetOrCreateProgress.run(userId, data)

    progress.isCompleted = !progress.isCompleted

    this.#capPercent(progress, 'readPercent')
    this.#capPercent(progress, 'watchPercent')

    return progress.save()
  }

  #capPercent(progress: Progress, key: 'readPercent' | 'watchPercent') {
    if (progress[key] && progress[key] >= Progress.completedPercentThreshold) {
      progress[key] = Progress.completedPercentThreshold - 1
    }
  }
}
