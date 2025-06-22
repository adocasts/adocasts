import BaseAction from '#actions/base_action'
import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import { Session } from '@adonisjs/session'
import GetLesson from './get_lesson.js'

export default class TogglePostAutoplay extends BaseAction<[User | Session]> {
  async asController({ view, params, auth, session }: HttpContext) {
    const lesson = await GetLesson.run(params.slug)

    await this.handle(auth.user || session)

    view.share({ isFragment: true })

    return view.render('components/frags/lesson/autoplay_toggle', { lesson })
  }

  async handle(userOrSession: User | Session) {
    if (userOrSession instanceof User) {
      const user = userOrSession
      user.isEnabledAutoplayNext = !user.isEnabledAutoplayNext

      await user.save()

      return user
    }

    const session = userOrSession
    session.put('autoplayNext', !session.get('autoplayNext'))
    return session
  }
}
