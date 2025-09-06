import BaseAction from '#actions/base_action'
import Testimonial from '#models/testimonial'
import { HttpContext } from '@adonisjs/core/http'

export default class RenderTestimonialForm extends BaseAction {
  async authorize({ bouncer, params }: HttpContext) {
    if (!params.id) {
      return bouncer.with('TestimonialPolicy').authorize('store')
    }

    const testimonial = await Testimonial.findOrFail(params.id)

    await bouncer.with('TestimonialPolicy').authorize('update', testimonial)

    return testimonial
  }

  async asController({ view }: HttpContext, _: any, testimonial: Testimonial | null = null) {
    return view.render('pages/testimonials/form', { testimonial })
  }
}
