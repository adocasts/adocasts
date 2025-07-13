import BaseAction from '#actions/base_action'
import { Request } from '@adonisjs/core/http'
import { UAParser } from 'ua-parser-js'

type Arguments = [request: Request]

export default class GetUserAgent extends BaseAction<Arguments> {
  async handle(...args: Arguments) {
    const [request] = args
    return UAParser(request.header('User-Agent'))
  }
}
