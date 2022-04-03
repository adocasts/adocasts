import { DateTime } from 'luxon'
import { BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Asset from './Asset'
import AppBaseModel from 'App/Models/AppBaseModel'

export default class Profile extends AppBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public avatarAssetId: number | null

  @column()
  public biography: string | null

  @column()
  public location: string | null

  @column()
  public website: string | null

  @column()
  public company: string | null

  @column()
  public twitterUrl: string | null

  @column()
  public facebookUrl: string | null

  @column()
  public instagramUrl: string | null

  @column()
  public linkedinUrl: string | null

  @column()
  public youtubeUrl: string | null

  @column()
  public githubUrl: string | null

  @column()
  public emailOnComment: boolean

  @column()
  public emailOnCommentReply: boolean

  @column()
  public emailOnAchievement: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Asset)
  public asset: BelongsTo<typeof Asset>
}
