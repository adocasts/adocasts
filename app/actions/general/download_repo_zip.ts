import BaseAction from '#actions/base_action'
import UnauthorizedException from '#exceptions/unauthorized_exception'
import User from '#models/user'
import GitHubService from '#services/github_service'
import { StripeService } from '#services/stripe_service'
import { HttpContext } from '@adonisjs/http-server'

export default class DownloadRepoZipUrl extends BaseAction {
  async asController({ request, response, auth }: HttpContext) {
    const repositoryUrl = request.input('repositoryUrl')
    const url = await this.handle(auth!.user!, repositoryUrl)

    return response.json({ url })
  }

  async handle(user: User, repositoryUrl: string) {
    // Plus sunset: downloads open to any authenticated user, but still require auth (anti-bot)
    if (!user) {
      throw new UnauthorizedException('You must be signed in to download repositories')
    }

    if (StripeService.isActive && user.isFreeTier) {
      throw new UnauthorizedException(
        'Repository downloads are restricted to Adocasts Plus members'
      )
    }

    const service = new GitHubService()

    return service.getZipDownloadUrl(repositoryUrl)
  }
}
