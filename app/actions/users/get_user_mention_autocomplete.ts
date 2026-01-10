import BaseAction from '#actions/base_action'
import User from '#models/user'
import { mentionListValidator } from '#validators/user'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'

type Validator = Infer<typeof mentionListValidator>

export default class GetUserMentionAutocomplete extends BaseAction {
  validator = mentionListValidator

  async asController({ response, auth }: HttpContext, { pattern }: Validator) {
    const usernames = await this.handle(pattern, [auth.user!.id])

    return response.json(usernames)
  }

  async handle(pattern?: string, ignoreIds: number[] = [], limit: number = 3) {
    const matches = await User.query()
      .if(pattern, (query) => query.whereILike('username', `%${pattern}%`))
      .where('isEnabledMentions', true)
      .whereNotIn('id', ignoreIds)
      .select('username')
      .orderBy('username')
      .limit(limit)

    return matches.map((user) => user.username.toLowerCase()).toSorted((a, b) => a.localeCompare(b))
  }
}
