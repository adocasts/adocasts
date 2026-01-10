import { UserFactory } from '#database/factories/user_factory'
import Profile from '#models/profile'
import Factory from '@adonisjs/lucid/factories'

export const ProfileFactory = Factory.define(Profile, ({ faker }) => ({
  biography: faker.lorem.paragraph(),
  location: faker.location.state() + ', ' + faker.location.country(),
  website: faker.internet.url(),
  name: faker.person.fullName(),
}))
  .relation('user', () => UserFactory)
  .build()
