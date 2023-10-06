import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'
import { UserFactory } from 'Database/factories/UserFactory'
import HttpStatus from 'App/Enums/HttpStatus'
import User from 'App/Models/User'

test.group('Auth sign up', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('should sign up a user', async ({ client }) => {
    const response = await client.post('/signup').withCsrfToken().form({
      username: 'test',
      email: 'test@adocasts.com',
      password: 'Password!01',
    })

    response.assertStatus(HttpStatus.OK)
    response.assertRedirectsToRoute('home.index')
  })

  test('should fail to sign up a user when username is in use', async ({ client }) => {
    const user = await UserFactory.merge({ password: 'Password!01' }).create()

    const response = await client.post('/signup').header('Referer', '/signup').withCsrfToken().form({
      username: user.username,
      email: 'test@adocasts.com',
      password: 'Password!01',
    })

    response.assertStatus(HttpStatus.OK)
    response.assertRedirectsToRoute('auth.signup')
    response.assertTextIncludes('This username is already taken')
  })

  test('should fail to sign up a user when email is in use', async ({ client }) => {
    const user = await UserFactory.merge({ password: 'Password!01' }).create()
    const response = await client.post('/signup').header('Referer', '/signup').withCsrfToken().form({
      username: 'test',
      email: user.email,
      password: 'Password!01',
    })

    response.assertStatus(HttpStatus.OK)
    response.assertRedirectsToRoute('auth.signup')
    response.assertTextIncludes('This account already exists')
  })

  test('should redirect authenticated user away from sign up page', async ({ client }) => {
    const user = await UserFactory.merge({ password: 'Password!01' }).create()
    const response = await client.get('/signup').header('Referer', '/contact').loginAs(user)

    response.assertRedirectsTo('/contact')
    response.assertTextIncludes('You are already signed in')
  })

  test('should have a profile created with sign up', async ({ client, assert }) => {
    const response = await client.post('/signup').withCsrfToken().form({
      username: 'test',
      email: 'test@adocasts.com',
      password: 'Password!01',
    })

    response.assertStatus(HttpStatus.OK)

    const user = await User.findByOrFail('username', 'test')
    const profile = await user.related('profile').query().firstOrFail()

    assert.exists(profile)
  })
})