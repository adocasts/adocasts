import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import DiscussionViewTypes from '#enums/discussion_view_types'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Discussion from './discussion.js'

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

