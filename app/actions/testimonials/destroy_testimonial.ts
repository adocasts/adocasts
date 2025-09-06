import BaseAction from '#actions/base_action'
import Testimonial from '#models/testimonial'
import User from '#models/user'
import { HttpContext } from '@adonisjs/http-server'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class DestroyTestimonial extends BaseAction {
  async authorize({ bouncer, params }: HttpContext) {
    const testimonial = await Testimonial.findOrFail(params.id)

    await bouncer.with('TestimonialPolicy').authorize('delete', testimonial)

    return testimonial
  }

  async asController({ response, session, auth }: HttpContext, _: any, testimonial: Testimonial) {
    await this.handle(auth.user!, testimonial)

    session.toast('success', 'Your testimonial has been deleted')

    return response.redirect().back()
  }

  async handle(user: User, testimonial: Testimonial) {
    return db.transaction(async (trx) => {
      testimonial.useTransaction(trx)

      await testimonial.delete()

      await this.#promotePrevious(user, trx)
    })
  }

  async #promotePrevious(user: User, trx: TransactionClientContract) {
    const previous = await user
      .related('testimonials')
      .query()
      .whereNotNull('staleAt')
      .orderBy('createdAt', 'desc')
      .first()

    if (previous) {
      previous.useTransaction(trx)
      previous.staleAt = null
      await previous.save()
    }
  }
}
