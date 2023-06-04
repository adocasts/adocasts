import {HttpContextContract} from "@ioc:Adonis/Core/HttpContext";
import axios from "axios";
import Env from "@ioc:Adonis/Core/Env";

export default class TurnstileService {
  constructor(protected ctx: HttpContextContract) {}

  public async check() {
    if (this.ctx.session.get('TURNSTILE_STATUS') == true) {
      return true
    }
    
    const token = this.ctx.request.input('cf-turnstile-response')
    const ip = this.ctx.request.header('CF-Connecting-IP')

    const { data } = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      secret: Env.get('TURNSTILE_SECRET_KEY'),
      response: token,
      remoteip: ip
    })

    this.ctx.logger.info(`TURNSTILE: ${ip} - ${data.success}`)
    this.ctx.session.put('TURNSTILE_STATUS', data.success)

    if (!data.success) {
      this.ctx.session.flash('error', 'Your request has been flagged by Cloudflare and has not been processed')
    }

    return data.success
  }
}
