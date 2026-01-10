import BaseAction from '#actions/base_action'
import Progress from '#models/progress'
import { progressValidator } from '#validators/history'
import is from '@adonisjs/core/helpers/is'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'
import GetOrCreateProgress from './get_or_create_progress.js'

type Validator = Infer<typeof progressValidator>

export default class StoreProgress extends BaseAction {
  validator = progressValidator

  async asController({ response, auth }: HttpContext, data: Validator) {
    if (!auth.user) return

    const progression = await this.handle(auth.user.id, data)

    return response.json({ success: true, progression })
  }

  async handle(userId: number, data: Validator) {
    const progress = await GetOrCreateProgress.run(userId, data)

    // if new value is less than previously recorded value, ditch new value
    if (
      typeof data.watchSeconds === 'number' &&
      progress.watchSeconds &&
      data.watchSeconds < progress.watchSeconds
    ) {
      delete data.watchPercent
      delete data.watchSeconds
    }

    // if new value is less than previously recorded value, ditch new value
    if (
      typeof data.readPercent === 'number' &&
      progress.readPercent &&
      data.readPercent < progress.readPercent
    ) {
      delete data.readPercent
    }

    progress.merge(data)
    progress.isCompleted = this.#isPercentCompleted(progress)

    return progress.save()
  }

  #isPercentCompleted({ isCompleted, watchPercent, readPercent }: Progress) {
    if (isCompleted) return true
    if (is.number(watchPercent) && watchPercent >= Progress.completedPercentThreshold) return true
    if (is.number(readPercent) && readPercent >= Progress.completedPercentThreshold) return true

    return false
  }
}
