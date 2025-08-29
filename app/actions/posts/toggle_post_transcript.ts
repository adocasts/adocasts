import BaseAction from '#actions/base_action'
import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import { Session } from '@adonisjs/session'
import GetLesson from './get_lesson.js'

export default class TogglePostTranscript extends BaseAction<[User | Session]> {
  async asController({ view, params, auth, session }: HttpContext) {
    const lesson = await GetLesson.run(params.slug)

    const showTranscript = await this.handle(auth.user || session)

    view.share({ isFragment: true, showTranscript })

    return view.render('components/frags/lesson/transcript_toggle', { lesson })
  }

  async handle(userOrSession: User | Session) {
    if (userOrSession instanceof User) {
      const user = userOrSession

      user.isEnabledTranscript = !user.isEnabledTranscript

      await user.save()

      return user.isEnabledTranscript
    }

    const session = userOrSession
    const isEnabledTranscript = !(session.get('showTranscript', 'false') === 'true')

    session.put('showTranscript', isEnabledTranscript.toString())

    return isEnabledTranscript
  }
}
