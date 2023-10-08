import Factory from '@ioc:Adonis/Lucid/Factory'
import AssetTypes from 'App/Enums/AssetTypes'
import Asset from 'App/Models/Asset'

export const AssetFactory = Factory
  .define(Asset, ({ faker }) => ({
    filename: faker.image.url(),
    altText: faker.word.words(2),
    assetTypeId: AssetTypes.THUMBNAIL,
    byteSize: 0
  }))
  .state('thumbnail', (row, { faker }) => {
    row.assetTypeId = AssetTypes.THUMBNAIL
    row.filename = faker.image.url({ width: 1280, height: 720 })
  })
  .state('cover', (row, { faker }) => {
    row.assetTypeId = AssetTypes.COVER
    row.filename = faker.image.url({ width: 1280, height: 720 })
  })
  .state('icon', (row, { faker }) => {
    row.filename = faker.image.url({ width: 300, height: 300 })
  })
  .build()