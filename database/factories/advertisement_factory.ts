import factory from '@adonisjs/lucid/factories'
import Advertisement from '#models/advertisement'
import States from '#enums/states'
import { DateTime } from 'luxon'
import { UserFactory } from './user_factory.js'
import { AssetFactory } from './asset_factory.js'
import AdvertisementSizes from '#enums/advertisement_sizes'

export const AdvertisementFactory = factory
  .define(Advertisement, async ({ faker }) => {
    return {
      url: faker.internet.url(),
      startAt: DateTime.now(),
      endAt: DateTime.fromJSDate(faker.date.future()),
      stateId: States.PUBLIC,
    }
  })
  .state('mediumRectangle', (ad) => (ad.sizeId = AdvertisementSizes.MEDIUM_RECTANGLE))
  .state('leaderboard', (ad) => (ad.sizeId = AdvertisementSizes.LEADERBOARD))
  .state('private', (ad) => (ad.stateId = States.PRIVATE))
  .state('over', (ad, { faker }) => (ad.endAt = DateTime.fromJSDate(faker.date.past())))
  .state('scheduled', (ad, { faker }) => (ad.startAt = DateTime.fromJSDate(faker.date.future())))
  .relation('user', () => UserFactory)
  .relation('asset', () => AssetFactory)
  .build()
