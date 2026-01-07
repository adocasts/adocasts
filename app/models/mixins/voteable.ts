import User from '#models/user'
import { NormalizeConstructor } from '@adonisjs/core/types/helpers'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export const Voteable = <T extends NormalizeConstructor<typeof BaseModel>>(superclass: T) => {
  class VoteableMixin extends superclass {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare userId: number

    @belongsTo(() => User)
    declare user: BelongsTo<typeof User>
  }

  return VoteableMixin
}
