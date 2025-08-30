import BaseAction from '#actions/base_action'
import GetMentions from './get_mentions.js'

export default class GetNewMentions extends BaseAction {
  async handle(bodyOld: string, bodyNew: string) {
    const oldUsernames = await GetMentions.run(bodyOld)
    const newUsernames = await GetMentions.run(bodyNew)

    return newUsernames.filter((username) => !oldUsernames.includes(username))
  }
}
