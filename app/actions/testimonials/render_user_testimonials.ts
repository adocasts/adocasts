import BaseAction from '#actions/base_action'
import { HttpContext } from '@adonisjs/core/http'
import GetUserTestimonials from './get_user_testimonials.js'
import { testimonialPaginatorValidator } from '#validators/testimonial'
import { Infer } from '@vinejs/vine/types'

type Validator = Infer<typeof testimonialPaginatorValidator>

export default class RenderUserTestimonials extends BaseAction {
  validator = testimonialPaginatorValidator

  async asController({ view, auth }: HttpContext, data: Validator) {
    let testimonials = await GetUserTestimonials.run(auth.user!, data, 'testimonials.user')

    return view.render('pages/testimonials/user', { testimonials })
  }
}
