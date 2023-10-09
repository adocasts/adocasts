import Collection from 'App/Models/Collection'
import Factory from '@ioc:Adonis/Lucid/Factory'
import { UserFactory } from './UserFactory'
import { PostFactory } from './PostFactory'
import { AssetFactory } from './AssetFactory'
import CollectionTypes from 'App/Enums/CollectionTypes'

export const CollectionFactory = Factory
  .define(Collection, ({ faker }) => ({
    name: faker.commerce.productName(),
    description: faker.lorem.sentence(),
    collectionTypeId: CollectionTypes.SERIES
  }))
  .relation('owner', () => UserFactory)
  .relation('posts', () => PostFactory)
  .relation('children', () => CollectionFactory)
  .relation('asset', () => AssetFactory)
  .build()
