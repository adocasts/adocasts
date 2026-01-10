import BaseAction from '#actions/base_action'
import { HttpRequest } from '@adonisjs/core/http'
import { UAParser } from 'ua-parser-js'

export default class GetUserAgent extends BaseAction {
  async handle(requestOrUserAgent: HttpRequest | string | undefined) {
    if (!requestOrUserAgent) return

    if (requestOrUserAgent instanceof HttpRequest) {
      return UAParser(requestOrUserAgent.header('User-Agent'))
    }

    return UAParser(requestOrUserAgent)
  }
}
