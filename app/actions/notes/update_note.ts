import BaseAction from '#actions/base_action'
import GetRouteReferrer from '#actions/general/get_route_referrer'
import User from '#models/user'
import { noteUpdateValidator } from '#validators/note'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'
import GetPostNotes from './get_post_notes.js'

type Validator = Infer<typeof noteUpdateValidator>

export default class UpdateNote extends BaseAction {
  validator = noteUpdateValidator

  async asController({ view, response, params, session, auth, up }: HttpContext, data: Validator) {
    await this.handle(auth.user!, params.id, data)

    session.flash('success', 'Your note has been updated')

    if (up.isOriginPage) {
      return response.redirect().back()
    }

    if (data.forward) {
      const match = await GetRouteReferrer.run(data.forward)
      return response.redirect(match.referrer ?? `/users/notes/${params.id}`)
    }

    const notes = await GetPostNotes.run(auth.user?.id, data.postId)

    return view.render('components/lesson/notes', {
      lessonId: data.postId,
      notes: notes,
    })
  }

  async handle(user: User, id: number, { forward, atTimestamp, ...data }: Validator) {
    if (!atTimestamp) {
      data.timestampSeconds = null
    }

    const note = await user.related('notes').query().where({ id }).firstOrFail()

    await note.merge(data).save()

    return note
  }
}
