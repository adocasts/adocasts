import { AllyContract, GithubDriverContract, GoogleDriverContract, SocialProviders } from "@ioc:Adonis/Addons/Ally";
import { AuthContract } from "@ioc:Adonis/Addons/Auth";
import Database from "@ioc:Adonis/Lucid/Database";
import Role from "App/Enums/Roles";
import User from "App/Models/User";
import slugify from 'slugify'
import AssetService from "./AssetService";

export default class AuthSocialService {
  /**
   * get or create Adocasts user from social provider user details
   * @param auth 
   * @param ally 
   * @param provider 
   * @returns 
   */
  public static async getUser(auth: AuthContract, ally: AllyContract, provider: keyof SocialProviders) {
    const social = ally.use(provider)
    const state = this.checkForErrors(social)

    if (!state.success) return { ...state, user: null }

    return this.findOrCreateUser(auth, social, provider)
  }

  /**
   * unlink social provider from Adocasts user
   * @param user 
   * @param provider 
   */
  public static async unlink(user: User, provider: keyof SocialProviders) {
    const userIdKey = `${provider}Id`
    const userEmailKey = `${provider}Email`
    const tokenKey = `${provider}AccessToken`

    user[userIdKey] = null
    user[userEmailKey] = null
    user[tokenKey] = null

    await user.save()
  }

  /**
   * check social provider response for errors
   * @param social 
   * @returns 
   */
  private static checkForErrors(social: GoogleDriverContract | GithubDriverContract) {
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

  /**
   * find adocasts user or create a new one from social provider user details
   * @param auth 
   * @param social 
   * @param provider 
   * @returns 
   */
  private static async findOrCreateUser(auth: AuthContract, social: GoogleDriverContract | GithubDriverContract, provider: keyof SocialProviders) {
    const user = await social.user()
    const username = await this.getUniqueUsername(user.name)
    const userIdKey = `${provider}Id`
    const userEmailKey = `${provider}Email`
    const tokenKey = `${provider}AccessToken`

    let userMatch = await User.query()
      .if(user.email, query => query.where('email', user.email!))
      .orWhere(userIdKey, user.id)
      .first()

    if (!userMatch) {
      userMatch = await User.create({
        username,
        email: user.email!,
        avatarUrl: user.avatarUrl ?? undefined,
        roleId: Role.USER,
        [userIdKey]: user.id,
        [userEmailKey]: user.email,
        [tokenKey]: user.token.token
      })
    } else if (!auth.user && !userMatch[tokenKey]) {
      return { 
        success: false, 
        message: `This email is already tied to an account. Please login to your account using your email/username and password and add ${provider} through your settings.` 
      }
    } else if (!userMatch[userIdKey]) {
      userMatch[userIdKey] = user.id
      userMatch[userEmailKey] = user.email
      userMatch[tokenKey] = user.token.token
      await userMatch.save()
    }

    await AssetService.refreshAvatar(userMatch, user)

    return { success: true, user: userMatch, message: '' }
  }

  /**
   * turns social user's username into a Jagr safe username and ensures it's unique within the db
   * @param {string} username [description]
   */
  private static async getUniqueUsername(username: string) {
    if (typeof username !== 'string') {
      username = username + ''
    }

    username = slugify(username, { lower: true })
    
    const occurances = await Database.from('users').where('username', 'ILIKE', `${username}%`)
    
    return occurances.length ? `${username}-${occurances.length + 1}` : username
  }
}