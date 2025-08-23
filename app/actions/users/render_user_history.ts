import BaseAction from '#actions/base_action'
import LessonListDto from '#dtos/lesson_list'
import SeriesListDto from '#dtos/series_list'
import TopicDto from '#dtos/topic'
import Progress from '#models/progress'
import User from '#models/user'
import { progressShowValidator } from '#validators/history'
import { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'
import { Infer } from '@vinejs/vine/types'

type Validator = Infer<typeof progressShowValidator>

export default class RenderUserHistory extends BaseAction {
  #routeIdentifier = 'users.history'

  validator = progressShowValidator

  async asController({ view, auth }: HttpContext, { params, page, perPage }: Validator) {
    const user = auth.user!

    switch (params.tab) {
      case 'series':
        const series = await this.#getSeries(user, page, perPage)
        view.share({ series })
        break
      case 'lessons':
        const lessons = await this.#getLessons(user, page, perPage)
        view.share({ lessons })
        break
    }

    return view.render('pages/users/history', { tab: params.tab })
  }

  async #getSeries(user: User, page: number = 1, perPage: number = 20) {
    const baseUrl = router.makeUrl(this.#routeIdentifier, { tab: 'series' })
    const paginator = await Progress.build(user)
      .get()
      .collections((builder) =>
        builder
          .withPostCount()
          .withTotalMinutes()
          .withTaxonomies((query) => query.selectDto(TopicDto))
          .selectDto(SeriesListDto)
          .paginate(page, perPage, baseUrl)
      )

    return SeriesListDto.fromPaginator(paginator, { start: 1, end: paginator.lastPage })
  }

  async #getLessons(user: User, page: number = 1, perPage: number = 20) {
    const baseUrl = router.makeUrl(this.#routeIdentifier, { tab: 'lessons' })
    const paginator = await Progress.build(user)
      .get()
      .for('postId')
      .posts((builder) => builder.displayLesson().paginate(page, perPage, baseUrl))

    return LessonListDto.fromPaginator(paginator, { start: 1, end: paginator.lastPage })
  }
}
