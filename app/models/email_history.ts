import { EmailHistorySchema } from '#database/schema'
import User from '#models/user'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class EmailHistory extends EmailHistorySchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
