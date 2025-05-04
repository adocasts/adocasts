import BaseAction from '#core/actions/base_action'

export default class GetMentions extends BaseAction<[string]> {
  handle(body: string) {
    // get usernames from each data-id="id" where username can be alpha-numeric, dash, underscore, or period
    const matches = body.matchAll(/data-id="([a-zA-Z0-9_.-]+)"/g)

    // get usernames from regex matches
    return Array.from(matches).map((match) => match[1])
  }
}
