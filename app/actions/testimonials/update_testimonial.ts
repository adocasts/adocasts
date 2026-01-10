import BaseAction from '#actions/base_action'
import GetRouteReferrer from '#actions/general/get_route_referrer'
import Testimonial from '#models/testimonial'
import { testimonialValidator } from '#validators/testimonial'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'

type Validator = Infer<typeof testimonialValidator>

export default class UpdateTestimonial extends BaseAction {
  validator = testimonialValidator

  async authorize({ bouncer, params }: HttpContext) {
    const testimonial = await Testimonial.findOrFail(params.id)

    await bouncer.with('TestimonialPolicy').authorize('update', testimonial)

    return testimonial
  }

  async asController(
    { response, session }: HttpContext,
    data: Validator,
    testimonial: Testimonial
  ) {
    await this.handle(testimonial, data.body)

    session.flash('success', 'Your testimonial has been updated')

    const match = await GetRouteReferrer.run(data.forward)

    if (match.referrer) {
      return response.redirect(match.referrer)
    }

    return response.redirect().back()
  }

  async handle(testimonial: Testimonial, body: Validator['body']) {
    testimonial.merge({ body })

    // set back to pending
    testimonial.approvedAt = null
    testimonial.rejectedAt = null

    await testimonial.save()
  }
}
