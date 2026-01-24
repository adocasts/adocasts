import Collection from '#models/collection'
import Post from '#models/post'
import { BaseModel, column, computed, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class FrameworkVersion extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare framework: string

  @column()
  declare version: string

  @column()
  declare slug: string

  @column()
  declare sort: number | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @computed()
  get name() {
    return `${this.framework} ${this.version}`
  }

  @manyToMany(() => Post, {
    pivotTable: 'post_framework_versions',
    pivotTimestamps: true,
  })
  declare posts: ManyToMany<typeof Post>

  @manyToMany(() => Collection, {
    pivotTable: 'collection_framework_versions',
    pivotTimestamps: true,
  })
  declare collections: ManyToMany<typeof Collection>
}
