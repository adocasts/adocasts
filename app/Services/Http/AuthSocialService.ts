import { GoogleDriverContract, GithubDriverContract, SocialProviders } from "@ioc:Adonis/Addons/Ally";
import BaseHttpService from "App/Services/Http/BaseHttpService";
import User from "App/Models/User";
import RoleEnum from 'App/Enums/Roles'
import slugify from 'slugify'
import Database from "@ioc:Adonis/Lucid/Database";
import AssetService from "../AssetService";

export default class AuthSocialService extends BaseHttpService {
  /**
   * Get the authenticated user for the provided provider
   * @param {keyof SocialProviders} socialProvider [description]
   */
  public async getUser(socialProvider: keyof SocialProviders) {
    const social = this.ctx.ally.use(socialProvider)

    if (!this.checkForErrors(social)) {
      return { isSuccess: false, user: null }
    }

    const user = await this.findOrCreateUser(social, socialProvider)

    return { isSuccess: true, user }
  }

  /**
   * Returns whether there were any errors with the social authentication. Adds flash message if needed.
   * @param {GoogleDriverContract|GithubDriverContract} social [description]
   */
  private checkForErrors(social: GoogleDriverContract|GithubDriverContract) {
    if (social.accessDenied()) {
      this.ctx.session.flash('error', 'Access was denied')
      return false
    }

    if (social.stateMisMatch()) {
      this.ctx.session.flash('error', 'Request expired, please try again')
      return false
    }

    if (social.hasError()) {
      this.ctx.session.flash('error', social.getError() ?? "An unexpected error ocurred")
      return false
    }

    return true
  }

  /**
   * Find or create the social authenticated user
   * @param {GoogleDriverContract|GithubDriverContract} social            [description]
   * @param {keyof SocialProviders} socialProvider [description]
   */
  private async findOrCreateUser(social: GoogleDriverContract|GithubDriverContract, socialProvider: keyof SocialProviders) {
    const user = await social.user()
    const username = await this.getUniqueUsername(user.name)
    const tokenKey = `${socialProvider}AccessToken`

    let jagrUser = await User.query()
      .where('email', user.email!)
      .whereNotNull(tokenKey)
      .first()

    if (!jagrUser) {
      jagrUser = await User.create({
        username,
        email: user.email!,
        avatarUrl: user.avatarUrl ?? undefined,
        roleId: RoleEnum.USER,
        [tokenKey]: user.token.token
      })
    }

    await AssetService.refreshAvatar(jagrUser, user)

    return jagrUser
  }

  /**
   * Turns social user's username into a Jagr safe username and ensures it's unique within the db
   * @param {string} username [description]
   */
  private async getUniqueUsername(username: string) {
    username = slugify(username, { lower: true })
    const occurances = await Database.from('users').where('username', 'LIKE', `${username}%`)
    return occurances.length ? `${username}-${occurances.length}` : username
  }
}
