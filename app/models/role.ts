import { RoleSchema } from '#database/schema'
import User from '#models/user'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Role extends RoleSchema {
  @hasMany(() => User)
  declare users: HasMany<typeof User>
}
