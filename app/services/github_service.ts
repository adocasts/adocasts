import User from '#models/user'
import env from '#start/env'
import { Octokit } from '@octokit/core'

type GitHubUserInfo = {
  userId: number | string | null
  username: string | null
}

export default class GitHubService {
  #octokit: Octokit
  #headers = {
    'X-GitHub-Api-Version': '2022-11-28',
  }

  constructor() {
    this.#octokit = new Octokit({
      auth: env.get('GITHUB_PAT'),
    })
  }

  async getUserById(githubId: string | number) {
    try {
      const response = await this.#octokit.request('GET /user/{account_id}', {
        account_id: Number(githubId),
        headers: this.#headers,
      })

      return response.data
    } catch (error) {
      console.warn(`Could not find GitHub user for id '${githubId}'`, error.response?.status)
      return null
    }
  }

  async getUserByUsername(githubUsername: string) {
    try {
      const response = await this.#octokit.request('GET /users/{username}', {
        username: githubUsername,
        headers: this.#headers,
      })

      return response.data
    } catch (error) {
      console.warn(
        `Could not find GitHub user for username '${githubUsername}'`,
        error.response?.status
      )

      return null
    }
  }

  async #getGitHubUserInfo(user: User, username?: string) {
    const isUsernameDifferent =
      user.githubTeamInviteUsername && username && user.githubTeamInviteUsername !== username
    const info: GitHubUserInfo = {
      userId: user.githubTeamInviteUserId ?? user.githubId,
      username: username || user.githubTeamInviteUsername,
    }

    if (!info.userId && !info.username) {
      console.warn(`User ${user.id} has no GitHub identifiers for lookup`)
      return null
    }

    if ((!info.userId && info.username) || isUsernameDifferent) {
      const gh = await this.getUserByUsername(info.username!)

      if (!gh) return null

      info.userId = gh.id
    } else if (info.userId && !info.username) {
      const gh = await this.getUserById(info.userId)

      if (!gh) return null

      info.username = gh.login
    }

    return info
  }

  async syncUserTeamMembership(user: User) {
    if (!user.githubTeamInviteUsername || user.githubTeamInviteStatus !== 'pending') {
      return
    }

    try {
      const response = await this.#octokit.request(
        'GET /orgs/{org}/teams/{team_slug}/memberships/{username}',
        {
          org: 'adocasts',
          team_slug: 'adocasts-plus',
          username: user.githubTeamInviteUsername,
          headers: this.#headers,
        }
      )

      user.githubTeamInviteStatus = response.data.state

      await user.save()
    } catch (error) {
      const status = error.response?.status
      const data = error.response?.data
      console.error(
        `Error inviting user ${user.id} to GitHub Org (Status: ${status}):`,
        data || error.message
      )
    }
  }

  async inviteUserToTeam(user: User, username?: string) {
    const info = await this.#getGitHubUserInfo(user, username)
    const result = {
      success: false,
      message: '',
    }

    if (!info) {
      result.message = 'GitHub identifier could not be determined'
      return result
    }

    try {
      const payload: { invitee_id?: number; email?: string } = {}

      if (info.userId) {
        payload.invitee_id = Number(info.userId)
      } else {
        result.message = 'GitHub team invite payload could not find an identifier to send'
        return result
      }

      const response = await this.#octokit.request(
        'PUT /orgs/{org}/teams/{team_slug}/memberships/{username}',
        {
          org: 'adocasts',
          team_slug: 'adocasts-plus',
          username: info.username!,
          role: 'member',
          headers: this.#headers,
        }
      )

      user.githubTeamInviteUsername = info.username
      user.githubTeamInviteUserId = info.userId ? info.userId.toString() : null
      user.githubTeamInviteStatus = response.data.state

      await user.save()

      console.log(
        `Invitation sent successfully for user ${user.id}. Status: ${response.data.state || 'N/A'}`
      )

      result.success = true
      result.message = 'GitHub Team invite has been sent'
      return result
    } catch (error) {
      const status = error.response?.status
      const data = error.response?.data
      console.error(
        `Error inviting user ${user.id} to GitHub Org (Status: ${status}):`,
        data || error.message
      )

      user.githubTeamInviteStatus = 'failed'

      await user.save()

      result.message = data?.message || error.message
      return result
    }
  }

  async removeUserFromTeam(user: User) {
    const username = user.githubTeamInviteUsername
    const result = {
      success: true,
      message: 'You have been removed from the Adocasts Plus GitHub team',
    }

    if (!username) {
      console.warn(`User ${user.id} has no recorded GitHub username. Cannot remove.`)

      user.githubTeamInviteStatus = 'removed'
      await user.save()

      return result
    }

    try {
      await this.#octokit.request('DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}', {
        org: 'adocasts',
        team_slug: 'adocasts-plus',
        username: username,
        headers: this.#headers,
      })

      // update on success (204 or 404 handled)
      user.githubTeamInviteStatus = 'removed'
      await user.save()

      console.log(`User ${user.id} (${username}) successfully removed from GitHub Org.`)

      return result
    } catch (error) {
      const status = error.response?.status

      // a 404 means the user wasn't a member anyway, which is a success state for removal.
      if (status === 404) {
        user.githubTeamInviteStatus = 'removed'
        await user.save()

        console.log(
          `User ${user.id} (${username}) was not found in the org (already removed or never joined). Marking as 'removed'.`
        )

        return result
      }

      console.error(
        `Error removing user ${user.id} from GitHub Org (Status: ${status}):`,
        error.response?.data || error.message
      )

      return {
        success: false,
        message: error.response?.data?.message || error.message,
      }
    }
  }
}
