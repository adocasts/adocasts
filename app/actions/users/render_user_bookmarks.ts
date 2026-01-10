import BaseAction from '#actions/base_action'
import LessonListDto from '#dtos/lesson_list'
import Post from '#models/post'
import { watchlistShowValidator } from '#validators/watchlist'
import router from '@adonisjs/core/services/router'
import { HttpContext } from '@adonisjs/http-server'
import { Infer } from '@vinejs/vine/types'

type Validator = Infer<typeof watchlistShowValidator>

export default class RenderUserBookmarks extends BaseAction {
  #routeIdentifier = 'users.bookmarks'

  validator = watchlistShowValidator

  async asController({ view, auth }: HttpContext, { page, perPage }: Validator) {
    const userId = auth.user!.id
    const lessons = await this.#getLessons(userId, page, perPage)

    return view.render('pages/users/bookmarks', { lessons })
  }

  async #getLessons(userId: number, page: number = 1, perPage: number = 20) {
    const baseUrl = router.makeUrl(this.#routeIdentifier, { tab: 'lessons' })
    const paginator = await Post.build()
      .displayLesson()
      .whereInWatchlist(userId)
      .paginate(page, perPage, baseUrl)

    return LessonListDto.fromPaginator(paginator, { start: 1, end: paginator.lastPage })
  }
}
