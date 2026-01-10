import BaseAction from '#actions/base_action'
import User from '#models/user'
import GitHubService from '#services/integrations/github_service'

export default class SyncUserGitHubTeamMembership extends BaseAction {
  async handle(user: User) {
    if (user.isFreeTier) return
    const service = new GitHubService()
    await service.syncUserTeamMembership(user)
  }
}
