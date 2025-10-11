import User from '#models/user'
import Note from '#models/note'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'
import db from '@adonisjs/lucid/services/db'

export default class NotePolicy extends BasePolicy {
  async view(_user: User): Promise<AuthorizerResponse> {
    return true
  }

  async store(user: User): Promise<AuthorizerResponse> {
    if (!user.isFreeTier) {
      return true
    }

    const { count } = await db.from('notes').where('user_id', user.id).count('*').firstOrFail()
    console.log({ count })
    return Number(count) <= Note.freeLimit
  }

  async updae(user: User, note: Note): Promise<AuthorizerResponse> {
    return user.id === note.userId
  }

  async destroy(user: User, note: Note): Promise<AuthorizerResponse> {
    return user.id === note.userId
  }
}
