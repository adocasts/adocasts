import BaseAction from '#actions/base_action'
import User from '#models/user'
import GitHubService from '#services/github_service'
import { HttpContext } from '@adonisjs/core/http'

export default class RemoveUserFromGitHubTeam extends BaseAction {
  async asController({ response, auth, session }: HttpContext) {
    const result = await this.handle(auth.user!)
    const status = result.success ? 'success' : 'error'

    session.toast(status, result.message)

    return response.redirect().back()
  }

  async handle(user: User) {
    const service = new GitHubService()
    return service.removeUserFromTeam(user)
  }
}
