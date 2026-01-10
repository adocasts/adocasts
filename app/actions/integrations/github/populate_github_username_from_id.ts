import BaseAction from '#actions/base_action'
import User from '#models/user'
import GitHubService from '#services/integrations/github_service'

export default class PopulateGitHubUsernameFromId extends BaseAction {
  async handle(user: User) {
    if (!user.githubId || user.githubTeamInviteUsername) {
      return
    }

    const service = new GitHubService()
    const gh = await service.getUserById(user.githubId)

    if (!gh) {
      return
    }

    user.githubTeamInviteUsername = gh.login
    await user.save()
  }
}
