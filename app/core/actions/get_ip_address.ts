import { Request } from '@adonisjs/core/http'
import BaseAction from './base_action.js'

export default class GetIpAddress extends BaseAction<[Request]> {
  handle(request: Request) {
    const cfConnectingIp = request.header('Cf-Connecting-Ip')

    if (cfConnectingIp) return cfConnectingIp

    const xForwardedFor = request.header('X-Forwarded-For')

    if (xForwardedFor) return xForwardedFor.split(',').at(0)

    return request.ip()
  }
}
