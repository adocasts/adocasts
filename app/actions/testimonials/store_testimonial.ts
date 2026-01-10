import BaseAction from '#actions/base_action'
import GetRouteReferrer from '#actions/general/get_route_referrer'
import User from '#models/user'
import logger from '#services/logger_service'
import { testimonialValidator } from '#validators/testimonial'
import stringHelpers from '@adonisjs/core/helpers/string'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'
import { DateTime } from 'luxon'

type Validator = Infer<typeof testimonialValidator>

export default class StoreTestimonial extends BaseAction {
  validator = testimonialValidator

  async authorize({ bouncer }: HttpContext) {
    await bouncer.with('TestimonialPolicy').authorize('store')
  }

  async asController({ response, auth, session }: HttpContext, data: Validator) {
    await this.handle(auth.user!, data.body)

    session.flash('success', 'Thanks for sharing your story!')

    await logger.info('New testimonial created', { body: stringHelpers.excerpt(data.body, 100) })

    const match = await GetRouteReferrer.run(data.forward)

    return response.redirect(match.referrer ?? '/')
  }

  async handle(user: User, body: Validator['body']) {
    await this.#markPastAsStale(user)

    return user.related('testimonials').create({ body })
  }

  async #markPastAsStale(user: User) {
    await user
      .related('testimonials')
      .query()
      .whereNull('staleAt')
      .update({ staleAt: DateTime.now() })
  }
}
