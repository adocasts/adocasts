import BaseAction from '#actions/base_action'
import User from '#models/user'
import GitHubService from '#services/integrations/github_service'
import { githubTeamInviteValidator } from '#validators/user_setting'
import { HttpContext } from '@adonisjs/http-server'
import { Infer } from '@vinejs/vine/types'

type Validator = Infer<typeof githubTeamInviteValidator>

export default class SendGitHubTeamInvite extends BaseAction {
  validator = githubTeamInviteValidator

  async asController({ response, auth, session }: HttpContext, data: Validator) {
    const result = await this.handle(auth.user!, data.username)
    const status = result.success ? 'success' : 'error'

    session.flash(status, result.message)

    return response.redirect().back()
  }

  async handle(user: User, username?: string) {
    if (user.isFreeTier) {
      return {
        success: false,
        message: 'GitHub Team invites are restricted to Adocasts Plus members',
      }
    }

    const service = new GitHubService()

    return service.inviteUserToTeam(user, username)
  }
}
