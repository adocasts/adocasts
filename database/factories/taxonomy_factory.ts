import Taxonomy from '#models/taxonomy'
import Factory from '@adonisjs/lucid/factories'
import { PostFactory } from '#factories/post_factory'
import { AssetFactory } from '#factories/asset_factory'
import { CollectionFactory } from '#factories/collection_factory'

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
