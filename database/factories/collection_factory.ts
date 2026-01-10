import { AssetFactory } from '#database/factories/asset_factory'
import { PostFactory } from '#database/factories/post_factory'
import { UserFactory } from '#database/factories/user_factory'
import CollectionTypes from '#enums/collection_types'
import Collection from '#models/collection'
import Factory from '@adonisjs/lucid/factories'

export const CollectionFactory = Factory.define(Collection, ({ faker }) => ({
  name: faker.commerce.productName(),
  description: faker.lorem.sentence(),
  collectionTypeId: CollectionTypes.SERIES,
}))
  .relation('owner', () => UserFactory)
  .relation('posts', () => PostFactory)
  .relation('children', () => CollectionFactory)
  .relation('asset', () => AssetFactory)
  .build()
