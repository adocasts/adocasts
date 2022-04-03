import { DateTime } from 'luxon'
import { BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import HistoryTypes from 'App/Enums/HistoryTypes'
import AppBaseModel from 'App/Models/AppBaseModel'
import Post from 'App/Models/Post'
import Collection from 'App/Models/Collection'
import Taxonomy from 'App/Models/Taxonomy'

export default class History extends AppBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public postId: number | null

  @column()
  public collectionId: number | null

  @column()
  public taxonomyId: number | null

  @column()
  public historyTypeId: HistoryTypes

  @column()
  public route: string

  @column()
  public readPercent: number | null

  @column()
  public watchPercent: number | null

  @column()
  public watchSeconds: number

  @column()
  public isCompleted: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Post)
  public post: BelongsTo<typeof Post>

  @belongsTo(() => Collection)
  public collection: BelongsTo<typeof Collection>

  @belongsTo(() => Taxonomy)
  public taxonomy: BelongsTo<typeof Taxonomy>
}
