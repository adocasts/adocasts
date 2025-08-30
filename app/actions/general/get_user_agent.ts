import BaseAction from '#actions/base_action'
import { Request } from '@adonisjs/core/http'
import { UAParser } from 'ua-parser-js'

export default class GetUserAgent extends BaseAction {
  async handle(requestOrUserAgent: Request | string | undefined) {
    if (!requestOrUserAgent) return

    if (requestOrUserAgent instanceof Request) {
      return UAParser(requestOrUserAgent.header('User-Agent'))
    }

    return UAParser(requestOrUserAgent)
  }
}
