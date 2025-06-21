import BaseAction from '#actions/base_action'
import User from '#models/user'
import { watchlistPostValidator } from '#validators/watchlist'
import { HttpContext } from '@adonisjs/core/http'
import GetLesson from './get_lesson.js'

export default class TogglePostWatchlist extends BaseAction<[User, number]> {
  validator = watchlistPostValidator

  async asController({ view, auth, params }: HttpContext) {
    const lesson = await GetLesson.run(params.slug)
    const result = await this.handle(auth.user!, lesson.id)

    lesson.meta.isInWatchlist = result.isInWatchlist

    return view.render('components/frags/lesson/bookmark_toggle', { lesson })
  }

  async handle(user: User, postId: number) {
    const record = await user.related('watchlist').query().where({ postId }).first()

    const watchlist = record
      ? await record.delete()
      : await user.related('watchlist').create({ postId })

    return { watchlist, isInWatchlist: !record }
  }
}
