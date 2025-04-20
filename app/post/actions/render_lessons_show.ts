import GetSeries from '#collection/actions/get_series'
import BaseAction from '#core/actions/base_action'
import LessonShowDto from '#post/dtos/lesson_show'
import { HttpContext } from '@adonisjs/core/http'
import GetLesson from './get_lesson.js'

export default class RenderLessonShow extends BaseAction {
  async asController({ view, params }: HttpContext) {
    const lesson = await GetLesson.run(params.slug)
    const series = await this.#getLessonSeries(lesson, params)

    return view.render('pages/lessons/show', { lesson, series })
  }

  async #getLessonSeries(lesson: LessonShowDto, params: Record<string, any>) {
    const paramSeries = params.series?.toLowerCase()
    let slug = lesson.series.at(0)?.slug

    if (paramSeries && lesson.series.some((s) => s.slug === paramSeries)) {
      slug = params.series.toLowerCase()
    }

    if (!slug) return null

    return await GetSeries.run(slug)
  }
}
