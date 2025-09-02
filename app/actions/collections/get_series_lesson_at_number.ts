import BaseAction from '#actions/base_action'
import Collection from '#models/collection'
import { HttpContext } from '@adonisjs/http-server'

export default class GetSeriesLessonAtNumber extends BaseAction {
  async asController({ params, response }: HttpContext) {
    const lesson = await this.handle(params.series, params.number)

    return response.redirect().withQs().toPath(lesson.routeUrl)
  }

  async handle(slug: string, number: number) {
    const series = await Collection.query().where({ slug }).firstOrFail()
    const lesson = await series
      .related('postsFlattened')
      .query()
      .where('root_sort_order', number - 1)
      .firstOrFail()

    return lesson
  }
}
