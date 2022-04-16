import Factory from '@ioc:Adonis/Lucid/Factory'
import User from 'App/Models/User'

export const UserFactory = Factory.define(User, ({ faker }) => ({
	username: faker.internet.userName(),
	email: faker.internet.email(),
	password: faker.internet.password()
})).build()