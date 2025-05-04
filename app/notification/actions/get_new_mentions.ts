import BaseAction from '#core/actions/base_action'
import GetMentions from './get_mentions.js'

export default class GetNewMentions extends BaseAction<[string, string]> {
  handle(bodyOld: string, bodyNew: string) {
    const oldUsernames = GetMentions.run(bodyOld)
    const newUsernames = GetMentions.run(bodyNew)

    return newUsernames.filter((username) => !oldUsernames.includes(username))
  }
}
