import { DateTime } from 'luxon'
import { BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Post from './Post'
import AppBaseModel from 'App/Models/AppBaseModel'

export default class PostSnapshot extends AppBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public postId: number

  @column()
  public revision: number

  @column.dateTime()
  public revisionDate: DateTime

  @column()
  public revisedBy: number

  @column()
  public title: string

  @column()
  public slug: string

  @column()
  public pageTitle: string | null

  @column()
  public description: string | null

  @column()
  public metaDescription: string | null

  @column()
  public canonical: string | null

  @column()
  public body: string | null

  @column()
  public videoUrl: string | null

  @column()
  public isFeatured: boolean | null

  @column()
  public isPersonal: boolean | null

  @column()
  public viewCount: number | null

  @column()
  public viewCountUnique: number | null

  @column()
  public stateId: number | null

  @column()
  public timezone: string | null

  @column()
  public publishAtUser: string | null

  @column.dateTime()
  public publishAt: DateTime | null

  @column.dateTime()
  public deletedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Post)
  public post: BelongsTo<typeof Post>
}
