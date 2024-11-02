import { DateTime } from 'luxon'
import { belongsTo, column, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Asset from '#models/asset'
import AppBaseModel from '#models/app_base_model'

export default class Profile extends AppBaseModel {
  serializeExtras: boolean = true

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare avatarAssetId: number | null

  @column()
  declare name: string | null

  @column()
  declare biography: string | null

  @column()
  declare location: string | null

  @column()
  declare website: string | null

  @column()
  declare company: string | null

  @column()
  declare twitterUrl: string | null

  @column()
  declare facebookUrl: string | null

  @column()
  declare instagramUrl: string | null

  @column()
  declare linkedinUrl: string | null

  @column()
  declare youtubeUrl: string | null

  @column()
  declare githubUrl: string | null

  @column()
  declare threadsUrl: string | null

  @column()
  declare blueskyUrl: string | null

  @column()
  declare emailOnComment: boolean

  @column()
  declare emailOnCommentReply: boolean

  @column()
  declare emailOnAchievement: boolean

  @column()
  declare emailOnNewDeviceLogin: boolean

  @column()
  declare emailOnWatchlist: boolean

  @column()
  declare emailOnMention: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

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
