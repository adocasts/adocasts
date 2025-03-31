import DiscussionViewTypes from '#discussion/enums/discussion_view_types'
import Discussion from '#discussion/models/discussion'
import User from '#user/models/user'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class DiscussionView extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number | null

  @column()
  declare discussionId: number

  @column()
  declare typeId: DiscussionViewTypes

  @column()
  declare ipAddress: string

  @column()
  declare userAgent: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Discussion)
  declare discussion: BelongsTo<typeof Discussion>
}
