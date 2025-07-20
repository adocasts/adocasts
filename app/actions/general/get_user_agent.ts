import BaseAction from '#actions/base_action'
import { Request } from '@adonisjs/core/http'
import { UAParser } from 'ua-parser-js'

type Arguments = [requestOrUserAgent: Request | string | undefined]

export default class GetUserAgent extends BaseAction<Arguments> {
  async handle(...args: Arguments) {
    const [requestOrUserAgent] = args

    if (!requestOrUserAgent) return

    if (requestOrUserAgent instanceof Request) {
      return UAParser(requestOrUserAgent.header('User-Agent'))
    }

    return UAParser(requestOrUserAgent)
  }
}
