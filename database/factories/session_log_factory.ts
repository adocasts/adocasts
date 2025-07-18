import factory from '@adonisjs/lucid/factories'
import SessionLog from '#models/session_log'
import stringHelpers from '@adonisjs/core/helpers/string'
import { DateTime } from 'luxon'
import { UserFactory } from './user_factory.js'

export const SessionLogFactory = factory
  .define(SessionLog, async ({ faker }) => {
    return {
      token: stringHelpers.generateRandom(16),
      ipAddress: faker.internet.ip(),
      userAgent: faker.internet.userAgent(),
      browserName: faker.lorem.word(),
      browserEngine: faker.lorem.word(),
      browserVersion: faker.lorem.word(),
      osName: faker.lorem.word(),
      osVersion: faker.lorem.word(),
      city: faker.location.city(),
      country: faker.location.country(),
      countryCode: faker.location.countryCode(),
      loginAt: DateTime.fromJSDate(faker.date.past()),
      loginSuccessful: true,
    }
  })
  .relation('user', () => UserFactory)
  .build()
