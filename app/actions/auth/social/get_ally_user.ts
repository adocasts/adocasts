import BaseAction from '#actions/base_action'
import Roles from '#enums/roles'
import User from '#models/user'
import AssetService from '#services/asset_service'
import { GithubDriver } from '@adonisjs/ally/drivers/github'
import { GoogleDriver } from '@adonisjs/ally/drivers/google'
import { SocialProviders } from '@adonisjs/ally/types'
import string from '@adonisjs/core/helpers/string'
import db from '@adonisjs/lucid/services/db'

type Driver = GithubDriver | GoogleDriver
type Provider = keyof SocialProviders

export default class GetAllyUser extends BaseAction<[Driver, Provider, User | undefined]> {
  async handle(social: Driver, provider: Provider, authUser?: User) {
    const validity = this.#validate(social)

    if (!validity.success) {
      return { ...validity, user: null }
    }

    const user = await social.user()
    const username = await this.#getUniqueUsername(user.name ?? user.email.split('@').at(0))
    const userIdKey = provider === 'github' ? 'githubId' : `googleId`
    const userEmailKey = provider === 'github' ? 'githubEmail' : `googleEmail`

    let userMatch = await User.query()
      .if(user.email, (query) => query.where('email', user.email!))
      .orWhere(userIdKey, user.id)
      .first()

    if (!userMatch) {
      let avatarUrl =
        user.avatarUrl && user.avatarUrl.length > 500 ? '' : (user.avatarUrl ?? undefined)
      userMatch = await User.create({
        username,
        email: user.email!,
        avatarUrl: avatarUrl,
        roleId: Roles.USER,
        [userIdKey]: user.id,
        [userEmailKey]: user.email,
      })
    } else if (!authUser && (!userMatch[userIdKey] || !userMatch[userEmailKey])) {
      return {
        success: false,
        message: `This email is already tied to an account. Please login to your account using your email/username and password and add ${provider} through your settings.`,
      }
    } else if (!userMatch[userIdKey]) {
      userMatch.merge({
        [userIdKey]: user.id,
        [userEmailKey]: user.email,
      })
      await userMatch.save()
    }

    await AssetService.refreshAvatar(userMatch, user)

    return { success: true, user: userMatch, message: '' }
  }

  #validate(social: Driver) {
    if (social.accessDenied()) {
      return { success: false, message: 'Access was denied' }
    }

    if (social.stateMisMatch()) {
      return { success: false, message: 'Request expired, please try again' }
    }

    if (social.hasError()) {
      return { success: false, message: social.getError() ?? 'An unexpected error ocurred' }
    }

    return { success: true, message: '' }
  }

  async #getUniqueUsername(username: string) {
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
