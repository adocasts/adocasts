import { TestimonialSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Testimonial extends TestimonialSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
