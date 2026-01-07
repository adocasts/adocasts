import type { HttpContext } from '@adonisjs/core/http'
import axios from 'axios'
import env from '#start/env'

export default class TurnstileService {
  private isEnabled = env.get('TURNSTILE_ENABLED')

  constructor(protected ctx: HttpContext) {}

  async check() {
    if (!this.isEnabled || this.ctx.session.get('TURNSTILE_STATUS') === 'true') {
      return true
    }

    const token = this.ctx.request.input('cf-turnstile-response')
    const ip = this.ctx.request.header('CF-Connecting-IP')

    const { data } = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      secret: env.get('TURNSTILE_SECRET_KEY'),
      response: token,
      remoteip: ip,
    })

    this.ctx.logger.info(`TURNSTILE: ${ip} - ${data.success}`)
    this.ctx.session.put('TURNSTILE_STATUS', data.success)

    if (!data.success) {
      this.ctx.session.toast(
        'error',
        'Your request has been flagged by Cloudflare and has not been processed'
      )
    }

    return data.success
  }
}
