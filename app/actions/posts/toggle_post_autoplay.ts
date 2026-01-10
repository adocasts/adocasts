import BaseAction from '#actions/base_action'
import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import { Session } from '@adonisjs/session'
import GetLesson from './get_lesson.js'

export default class TogglePostAutoplay extends BaseAction {
  async asController({ view, params, auth, session }: HttpContext) {
    const lesson = await GetLesson.run(params.slug)

    const autoplayNext = await this.handle(auth.user || session)

    view.share({ isFragment: true, autoplayNext })

    return view.render('components/frags/lesson/autoplay_toggle', { lesson })
  }

  async handle(userOrSession: User | Session) {
    if (userOrSession instanceof User) {
      const user = userOrSession

      user.isEnabledAutoplayNext = !user.isEnabledAutoplayNext

      await user.save()

      return user.isEnabledAutoplayNext
    }

    const session = userOrSession
    const isAutoplayNext = !(session.get('autoplayNext', 'true') === 'true')

    session.put('autoplayNext', isAutoplayNext.toString())

    return isAutoplayNext
  }
}
