import IdentityService from "../IdentityService"
import BaseHttpService from "./BaseHttpService"

export default class HttpIdentityService extends BaseHttpService {
  public async getRequestIdentity() {
    const ip = this.ctx.request.ip()
    const agent = this.ctx.request.headers()['user-agent']
    return IdentityService.create(ip, agent)
  }
}