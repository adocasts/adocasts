import Collection from '#models/collection'
import Factory from '@adonisjs/lucid/factories'
import { UserFactory } from '#factories/user_factory'
import { PostFactory } from '#factories/post_factory'
import { AssetFactory } from '#factories/asset_factory'
import CollectionTypes from '#enums/collection_types'

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
