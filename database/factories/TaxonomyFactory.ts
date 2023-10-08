import Taxonomy from 'App/Models/Taxonomy'
import Factory from '@ioc:Adonis/Lucid/Factory'
import { PostFactory } from './PostFactory'
import { AssetFactory } from './AssetFactory'
import { CollectionFactory } from './CollectionFactory'

export const TaxonomyFactory = Factory
  .define(Taxonomy, ({ faker }) => ({
    name: faker.word.words({ count: { min: 1, max: 3 }}),
    description: faker.lorem.sentence(),
  }))
  .relation('collections', CollectionFactory)
  .relation('posts', () => PostFactory)
  .relation('children', () => TaxonomyFactory)
  .relation('asset', () => AssetFactory)
  .build()
