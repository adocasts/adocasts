import { AssetFactory } from '#database/factories/asset_factory'
import { CollectionFactory } from '#database/factories/collection_factory'
import { PostFactory } from '#database/factories/post_factory'
import Taxonomy from '#models/taxonomy'
import Factory from '@adonisjs/lucid/factories'

export const TaxonomyFactory = Factory.define(Taxonomy, ({ faker }) => ({
  name: faker.word.words({ count: { min: 1, max: 3 } }),
  description: faker.lorem.sentence(),
}))
  .relation('collections', CollectionFactory)
  .relation('posts', () => PostFactory)
  .relation('children', () => TaxonomyFactory)
  .relation('asset', () => AssetFactory)
  .build()
