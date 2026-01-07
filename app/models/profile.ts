import { ProfileSchema } from '#database/schema'
import Asset from '#models/asset'
import User from '#models/user'
import { belongsTo, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Profile extends ProfileSchema {
  serializeExtras: boolean = true

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Asset)
  declare asset: BelongsTo<typeof Asset>

  @computed()
  get websiteUrl() {
    if (!this.website) return ''
    if (!this.website.startsWith('https://') && !this.website.startsWith('http://')) {
      return `https://${this.website}`
    }
    return this.website
  }
}
