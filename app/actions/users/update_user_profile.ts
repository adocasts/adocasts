import BaseAction from '#actions/base_action'
import User from '#models/user'
import assetStorage from '#services/asset_storage_service'
import { profileUpdateValidator } from '#validators/profile'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'

type Validator = Infer<typeof profileUpdateValidator>

export default class UpdateUserProfile extends BaseAction<[User, Validator]> {
  validator = profileUpdateValidator

  async asController({ response, session, auth }: HttpContext, data: Validator) {
    await this.handle(auth.user!, data)

    session.flash('success', 'Your profile has been updated')

    return response.redirect().back()
  }

  async handle(user: User, { avatar, ...data }: Validator) {
    const profile = await user.related('profile').query().firstOrFail()

    await this.updateAvatar(user, avatar)
    await profile.merge(data).save()

    return profile
  }

  async updateAvatar(user: User, avatar: MultipartFile | undefined) {
    if (!avatar) return

    const avatarUrl = user.avatarUrl
    const location = `${user.id}/profile/`
    const filename = `avatar_${new Date().getTime()}.${avatar.extname}`

    // upload and set new avatar
    await assetStorage.storeFromTmp(location, filename, avatar)
    await user.merge({ avatarUrl: location + filename }).save()

    // remove old if we were hosting it (wouldn't start with https if we were)
    if (avatarUrl && !avatarUrl.startsWith('https') && avatarUrl !== location + filename) {
      await assetStorage.destroy(avatarUrl)
    }
  }
}
