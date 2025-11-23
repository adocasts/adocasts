import BaseAction from '#actions/base_action'
import UnauthorizedException from '#exceptions/unauthorized_exception'
import User from '#models/user'
import GitHubService from '#services/github_service'
import { HttpContext } from '@adonisjs/http-server'

export default class DownloadRepoZipUrl extends BaseAction {
  async asController({ request, response, auth }: HttpContext) {
    const repositoryUrl = request.input('repositoryUrl')
    const url = await this.handle(auth!.user!, repositoryUrl)

    return response.json({ url })
  }

  async handle(user: User, repositoryUrl: string) {
    if (!user || user.isFreeTier) {
      throw new UnauthorizedException(
        'Repository downloads are restricted to Adocasts Plus members'
      )
    }

    const service = new GitHubService()

    return service.getZipDownloadUrl(repositoryUrl)
  }
}
