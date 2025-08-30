import BaseAction from '#actions/base_action'
import { Request } from '@adonisjs/core/http'

export default class GetIpAddress extends BaseAction {
  handle(request: Request) {
    const cfConnectingIp = request.header('Cf-Connecting-Ip')

    if (cfConnectingIp) return cfConnectingIp

    const xForwardedFor = request.header('X-Forwarded-For')

    if (xForwardedFor) return xForwardedFor.split(',').at(0)

    return request.ip()
  }
}
