import BaseAction from '#actions/base_action'
import TestimonialDto from '#dtos/testimonial'
import User from '#models/user'
import { testimonialPaginatorValidator } from '#validators/testimonial'
import router from '@adonisjs/core/services/router'
import { Infer } from '@vinejs/vine/types'

export default class GetUserTestimonials extends BaseAction {
  async handle(
    user: User,
    { page = 1, perPage = 10 }: Infer<typeof testimonialPaginatorValidator>,
    routeIdentifier?: string
  ) {
    const paginator = await user
      .related('testimonials')
      .query()
      .preload('user', (query) => query.preload('profile'))
      .orderBy('createdAt', 'desc')
      .paginate(page, perPage)

    if (routeIdentifier) {
      const baseUrl = router.makeUrl(routeIdentifier)
      paginator.baseUrl(baseUrl)
    }

    return TestimonialDto.fromPaginator(paginator, { start: 1, end: paginator.lastPage })
  }
}
