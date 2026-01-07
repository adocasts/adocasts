import { AssetSchema } from '#database/schema'
import Collection from '#models/collection'
import Post from '#models/post'
import Taxonomy from '#models/taxonomy'
import { computed, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Asset extends AssetSchema {
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
