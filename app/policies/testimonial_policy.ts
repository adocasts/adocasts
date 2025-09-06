import BasePolicy from '#policies/base_policy'
import User from '#models/user'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import Testimonial from '#models/testimonial'

export default class TestimonialPolicy extends BasePolicy {
  store(_user: User) {
    return true
  }

  update(user: User, testimonial: Testimonial): AuthorizerResponse {
    if (this.isAdmin(user)) return true

    const isOwner = testimonial.userId === user.id
    return isOwner
  }

  delete(user: User, testimonial: Testimonial): AuthorizerResponse {
    if (this.isAdmin(user)) return true

    const isOwner = testimonial.userId === user.id
    return isOwner
  }
}
