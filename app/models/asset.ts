import { DateTime } from 'luxon'
import { BaseModel, column, computed, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Post from '#models/post'
import Collection from '#models/collection'
import Taxonomy from '#models/taxonomy'

export default class Asset extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare assetTypeId: number

  @column()
  declare filename: string

  @column()
  declare byteSize: number | null

  @column()
  declare altText: string | null

  @column()
  declare credit: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @computed()
  get assetUrl() {
    return '/img/' + this.filename
  }

  @manyToMany(() => Post, {
    pivotTable: 'asset_posts',
    pivotColumns: ['sort_order'],
  })
  declare posts: ManyToMany<typeof Post>

  @hasMany(() => Collection)
  declare collections: HasMany<typeof Collection>

  @hasMany(() => Taxonomy)
  declare taxonomies: HasMany<typeof Taxonomy>
}
