import BaseAction from '#actions/base_action'
import Note from '#models/note'

export default class GetPostNotes extends BaseAction {
  async handle(userId: number | undefined, postId: number) {
    if (!userId) return []

    return Note.query().where({ userId, postId }).orderBy('timestamp_seconds')
  }
}
