import BaseAction from '#actions/base_action'
import GetPostNotes from '#actions/notes/get_post_notes'
import NotFoundException from '#exceptions/not_found_exception'
import PostPolicy from '#policies/post_policy'
import timeHelpers from '#services/helpers/time'
import { type HttpContext } from '@adonisjs/core/http'
import type LessonShowDto from '../../dtos/lesson_show.js'
import GetSeries from '../collections/get_series.js'
import GetLesson from './get_lesson.js'
import GetTranscript from './get_transcript.js'

export default class RenderLessonShow extends BaseAction {
  async asController({ view, params, auth, bouncer }: HttpContext) {
    const lesson = await GetLesson.run(params.slug, auth.user?.id, { skipPublishCheck: true })
    const series = await this.#getLessonSeries(lesson, params)
    const transcript = await GetTranscript.run(lesson)
    const notes = await GetPostNotes.run(auth.user?.id, lesson.id)

    if (await bouncer.with(PostPolicy).denies('state', lesson)) {
      throw new NotFoundException('This post is not currently available to the public')
    }

    if (!lesson.repositoryUrl && series?.repositoryUrl) {
      lesson.repositoryUrl = series.repositoryUrl
      lesson.repositoryAccessLevel = series.repositoryAccessLevel
    }

    if (await this.#cannotView(bouncer, lesson)) {
      return view.render('pages/lessons/soon', { lesson, series })
    }

    return view.render('pages/lessons/show', { lesson, series, transcript, notes })
  }

  async #getLessonSeries(lesson: LessonShowDto, params: Record<string, any>) {
    const paramSeries = params.series?.toLowerCase()
    let slug = lesson.series.at(0)?.slug

    if (paramSeries && lesson.series.some((s) => s.slug === paramSeries)) {
      slug = params.series.toLowerCase()
    }

    if (!slug) return null

    return GetSeries.run(slug)
  }

  async #cannotView(bouncer: HttpContext['bouncer'], lesson: LessonShowDto) {
    const isPublished = timeHelpers.getIsPublished(lesson)
    return !isPublished && (await bouncer.with(PostPolicy).denies('viewFutureDated'))
  }
}
