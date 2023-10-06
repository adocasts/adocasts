import Factory from '@ioc:Adonis/Lucid/Factory'
import Asset from 'App/Models/Asset'

export const AssetFactory = Factory
  .define(Asset, ({ faker }) => ({
    filename: faker.image.url(),
    altText: faker.word.words(2)
  }))
  .build()