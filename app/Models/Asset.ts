import { DateTime } from 'luxon'
import { column, computed, HasMany, hasMany, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Post from './Post'
import AssetService from 'App/Services/AssetService'
import AppBaseModel from 'App/Models/AppBaseModel'
import Collection from 'App/Models/Collection'
import Taxonomy from 'App/Models/Taxonomy'

export default class Asset extends AppBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public assetTypeId: number

  @column()
  public filename: string

  @column()
  public byteSize: number | null

  @column()
  public altText: string | null

  @column()
  public credit: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @computed()
  public get assetUrl() {
    return AssetService.getAssetUrl(this.filename)
  }

  @manyToMany(() => Post, {
    pivotTable: 'asset_posts',
    pivotColumns: ['sort_order']
  })
  public posts: ManyToMany<typeof Post>
  
  @hasMany(() => Collection)
  public collections: HasMany<typeof Collection>
  
  @hasMany(() => Taxonomy)
  public taxonomies: HasMany<typeof Taxonomy>
}
