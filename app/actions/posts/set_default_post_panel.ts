import BaseAction from '#actions/base_action'
import LessonPanels from '#enums/lesson_panels'
import User from '#models/user'
import { defaultPostPanelValidator } from '#validators/post'
import { HttpContext } from '@adonisjs/core/http'
import { Session } from '@adonisjs/session'
import { Infer } from '@vinejs/vine/types'

type Validator = Infer<typeof defaultPostPanelValidator>

export default class SetDefaultPostPanel extends BaseAction {
  validator = defaultPostPanelValidator

  async asController({ response, auth, session }: HttpContext, { panel }: Validator) {
    await this.handle(auth.user || session, panel)

    return response.noContent()
  }

  async handle(sessionOrUser: User | Session, panel: LessonPanels) {
    if (sessionOrUser instanceof User) {
      const user = sessionOrUser

      user.defaultLessonPanel = panel

      await user.save()

      return user.defaultLessonPanel
    }

    const session = sessionOrUser

    session.put('defaultLessonPanel', panel)

    return panel
  }
}
