import BaseAction from '#actions/base_action'
import CollectionBuilder from '#builders/collection_builder'
import LessonListDto from '#dtos/lesson_list'
import SeriesListDto from '#dtos/series_list'
import TopicDto from '#dtos/topic'
import Progress from '#models/progress'
import User from '#models/user'
import { progressShowValidator } from '#validators/history'
import { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'
import db from '@adonisjs/lucid/services/db'
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
    const collectionIds = await this.#getCollectionIdsLatestWatched(user)
    const builder = CollectionBuilder.new()
      .whereIn('id', collectionIds)
      .withPostCount()
      .withTotalMinutes()
      .withTaxonomies((query) => query.selectDto(TopicDto))
      .selectDto(SeriesListDto)

    builder.query
      .joinRaw('join unnest(?::int[]) WITH ORDINALITY t(id, ord) USING (id)', [
        `{${collectionIds.join(',')}}`,
      ])
      .orderBy('t.ord')

    const paginator = await builder.paginate(page, perPage, baseUrl)

    return SeriesListDto.fromPaginator(paginator, { start: 1, end: paginator.lastPage })
  }

  async #getCollectionIdsLatestWatched(user: User) {
    return db
      .rawQuery(
        `
      SELECT
        cp.root_collection_id
      FROM
           progresses p
      JOIN collection_posts cp ON p.post_id = cp.post_id
      WHERE
        p.user_id = ?
      AND (
          p.is_completed
        OR (p.watch_percent IS NOT NULL AND p.watch_percent > 0)
        OR (p.read_percent IS NOT NULL AND p.read_percent > 0)
      )
      GROUP BY
        cp.root_collection_id
      ORDER BY
        MAX(p.updated_at) desc
    `,
        [user.id]
      )
      .then((result) => result.rows.map((row: any) => row.root_collection_id))
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
