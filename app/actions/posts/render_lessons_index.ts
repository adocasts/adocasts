import BaseAction from '#actions/base_action'
import { HttpContext } from '@adonisjs/core/http'
import GetLessonsPaginated from './get_lessons_paginated.js'
import { postSearchValidator } from '#validators/post'
import { Infer } from '@vinejs/vine/types'
import GetTopicsFilter from '#actions/taxonomies/get_topics_filter'

export default class RenderLessonsIndex extends BaseAction {
  validator = postSearchValidator

  async asController({ view }: HttpContext, filters: Infer<typeof this.validator>) {
    const lessons = await GetLessonsPaginated.run(filters, 'lessons.index')
    const topics = await GetTopicsFilter.run('posts')

    return view.render('pages/lessons/index', { lessons, topics })
  }
}
