import Factory from '@ioc:Adonis/Lucid/Factory'
import Profile from 'App/Models/Profile'
import { UserFactory } from './UserFactory'

export const ProfileFactory = Factory
  .define(Profile, ({ faker }) => ({
    biography: faker.lorem.paragraph(),
    location: faker.location.state() + ', ' + faker.location.country(),
    website: faker.internet.url(),
    name: faker.person.fullName()
  }))
  .relation('user', () => UserFactory)
  .build()