import { forwardValidator } from '#validators/auth_validator'
import { Request } from '@adonisjs/core/http'

export default class ForwardService {
  static async tryGet(request: Request) {
    let forward: string | null = null

    try {
      const forwardData = await request.validateUsing(forwardValidator)
      forward = forwardData.forward || null
    } catch (_) {}

    return forward
  }
}
