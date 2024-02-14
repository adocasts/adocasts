import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import string from '@adonisjs/core/helpers/string'
import { SocialProviders } from '@adonisjs/ally/types'
import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import Roles from '#enums/roles'
import AssetService from './asset_service.js'

@inject()
export default class AuthSocialService {
  constructor(protected ctx: HttpContext) {}

  /**
   * get or create Adocasts user from social provider user details
   * @param auth
   * @param ally
   * @param provider
   * @returns
   */
  async getUser(provider: keyof SocialProviders) {
    const social = this.ctx.ally.use(provider)
    let success = true
    let message = ''

    if (social.accessDenied()) {
      success = false
      message = 'Access was denied'
    }

    if (social.stateMisMatch()) {
      success = false
      message = 'Request expired, please try again'
    }

    if (social.hasError()) {
      success = false
      message = social.getError() ?? 'An unexpected error ocurred'
    }

    if (!success) return { success, message, user: null }

    const user = await social.user()
    const username = await this.getUniqueUsername(user.name ?? user.email.split('@').at(0))
    const userIdKey = provider === 'github' ? 'githubId' : `googleId`
    const userEmailKey = provider === 'github' ? 'githubEmail' : `googleEmail`
    const tokenKey = provider === 'github' ? 'githubAccessToken' : `googleAccessToken`

    let userMatch = await User.query()
      .if(user.email, (query) => query.where('email', user.email!))
      .orWhere(userIdKey, user.id)
      .first()

    if (!userMatch) {
      let avatarUrl =
        user.avatarUrl && user.avatarUrl.length > 500 ? '' : user.avatarUrl ?? undefined
      userMatch = await User.create({
        username,
        email: user.email!,
        avatarUrl: avatarUrl,
        roleId: Roles.USER,
        [userIdKey]: user.id,
        [userEmailKey]: user.email,
        [tokenKey]: user.token.token,
      })
    } else if (!this.ctx.auth.user && !userMatch[tokenKey]) {
      return {
        success: false,
        message: `This email is already tied to an account. Please login to your account using your email/username and password and add ${provider} through your settings.`,
      }
    } else if (!userMatch[userIdKey]) {
      userMatch.merge({
        [userIdKey]: user.id,
        [userEmailKey]: user.email,
        [tokenKey]: user.token.token,
      })
      await userMatch.save()
    }

    await AssetService.refreshAvatar(userMatch, user)

    return { success: true, user: userMatch, message: '' }
  }

  /**
   * unlink social provider from Adocasts user
   * @param user
   * @param provider
   */
  async unlink(user: User, provider: keyof SocialProviders) {
    const userIdKey = `${provider}Id`
    const userEmailKey = `${provider}Email`
    const tokenKey = `${provider}AccessToken`

    user.merge({
      [userIdKey]: null,
      [userEmailKey]: null,
      [tokenKey]: null,
    })

    await user.save()
  }

  /**
   * turns social user's username into a Jagr safe username and ensures it's unique within the db
   * @param {string} username [description]
   */
  private async getUniqueUsername(username: string) {
    if (typeof username !== 'string') {
      username = username + ''
    }

    username = string.slug(username, { lower: true, strict: true })

    const occurances = await db.from('users').where('username', 'ILIKE', `${username}%`)
    const incrementors = occurances
      .map((o) => o.username.match(/-\d+$/)?.at(0).replace('-', ''))
      .filter(Boolean)
      .map((o) => Number.parseInt(o))

    const maxIncrementor = incrementors.length ? Math.max(...incrementors) : occurances.length
    return occurances.length ? `${username}-${maxIncrementor + 1}` : username
  }
}
