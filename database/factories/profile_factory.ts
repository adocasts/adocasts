import Factory from '@adonisjs/lucid/factories'
import Profile from '#models/profile'
import { UserFactory } from '#factories/user_factory'

export const ProfileFactory = Factory
  .define(Profile, ({ faker }) => ({
    biography: faker.lorem.paragraph(),
    location: faker.location.state() + ', ' + faker.location.country(),
    website: faker.internet.url(),
    name: faker.person.fullName()
  }))
  .relation('user', () => UserFactory)
  .build()