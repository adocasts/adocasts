import Note from '#models/note'
import User from '#models/user'
import { StripeService } from '#services/stripe_service'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'
import db from '@adonisjs/lucid/services/db'

export default class NotePolicy extends BasePolicy {
  async view(_user: User): Promise<AuthorizerResponse> {
    return true
  }

  async store(user: User): Promise<AuthorizerResponse> {
    // Plus sunset: note limit lifted for any authenticated user (route stays auth-gated)
    if (user && !StripeService.isActive) {
      return true
    }

    if (!user.isFreeTier) {
      return true
    }

    const { count } = await db.from('notes').where('user_id', user.id).count('*').firstOrFail()
    return Number(count) < Note.freeLimit
  }

  async update(user: User, note: Note): Promise<AuthorizerResponse> {
    return user.id === note.userId
  }

  async destroy(user: User, note: Note): Promise<AuthorizerResponse> {
    return user.id === note.userId
  }
}
