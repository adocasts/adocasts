import PostService from '#services/post_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'
import { DateTime } from 'luxon'

@inject()
export default class LessonsController {
  constructor(protected postService: PostService) {}
  
  async index({ view, request, params }: HttpContext) {
    const { page = 1, sortBy = 'publishAt', sort = 'desc' } = request.qs()

    if (page == 1 && sortBy === 'publishAt') {
      const recentDate = DateTime.now().minus({ days: 30 }).startOf('day')
      const recent = await this.postService
        .getLatestLessons()
        .where('publishAt', '>=', recentDate)

      view.share({ recent })
    }

    const items = await this.postService
      .getLessons()
      .orderBy(sortBy, sort)
      .paginate(page, 20, router.makeUrl('lessons.index', params))

    return view.render('pages/lessons/index', { items })
  }
  
  async show({}: HttpContext) {}
  
}