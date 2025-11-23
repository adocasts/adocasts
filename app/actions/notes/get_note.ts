import BaseAction from '#actions/base_action'
import User from '#models/user'

export default class GetNote extends BaseAction {
  async handle(user: User, id: number) {
    return user
      .related('notes')
      .query()
      .preload('post', (query) => query.preload('series'))
      .where({ id })
      .firstOrFail()
  }
}
