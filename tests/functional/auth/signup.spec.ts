import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'
import Route from '@ioc:Adonis/Core/Route'
import { UserFactory } from 'Database/factories'
import Env from '@ioc:Adonis/Core/Env'
import User from 'App/Models/User'
import Profile from 'App/Models/Profile'

test.group('Auth - Sign Up', (group) => {
  const appUrl = `http://${Env.get('HOST')}:${Env.get('PORT')}`

  // Write your test here
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('an unauthenticated user can view the signup page', async ({ client }) => {
    const response = await client.get(Route.makeUrl('auth.signup.show'))

    response.assertStatus(200)
    response.assertTextIncludes('Create your account')
  })

  test('an authenticated user gets redirected to home page', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const response = await client.get(Route.makeUrl('auth.signup.show')).loginAs(user)

    response.assertStatus(200)
    assert.equal(response.redirects()[0], `${appUrl}/`)
  })

  test('a user can sign up', async ({ client }) => {
    const response = await client.post(Route.makeUrl('auth.signup')).form({
      username: 'testuser1',
      email: 'testuser1@gmail.com',
      password: 'Password!01'
    }).redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/')
  })

  test('username must be unique', async ({ client }) => {
    const user = await UserFactory.create()
    const response = await client.post(Route.makeUrl('auth.signup')).form({
      username: user.username,
      email: 'testuser1@gmail.com',
      password: 'Password!01'
    }).redirects(0)

    response.assertStatus(302)
    response.assertFlashMessage('errors', { username: ['This username has already been taken'] })
  })

  test('email must be unique', async ({ client }) => {
    const user = await UserFactory.create()
    const response = await client.post(Route.makeUrl('auth.signup')).form({
      username: 'testuser1',
      email: user.email,
      password: 'Password!01'
    }).redirects(0)

    response.assertStatus(302)
    response.assertFlashMessage('errors', { email: ['An account with this email already exists'] })
  })

  test('email must be a valid email', async ({ client }) => {
    const response = await client.post(Route.makeUrl('auth.signup')).form({
      username: 'testuser1',
      email: 'testuser',
      password: 'Password!01'
    }).redirects(0)

    response.assertStatus(302)
    response.assertFlashMessage('errors', { email: ['Please enter a valid email'] })
  })

  test('password must be at least 8 characters long', async ({ client }) => {
    const response = await client.post(Route.makeUrl('auth.signup')).form({
      username: 'testuser1',
      email: 'testuser1@gmail.com',
      password: 'S!haer'
    }).redirects(0)

    response.assertStatus(302)
    response.assertFlashMessage('errors', { password: ['Password must be at least 8 characters long'] })
  })

  test('a new user should be given a profile', async ({ client, assert }) => {
    const user = await UserFactory.makeStubbed()
    const response = await client.post(Route.makeUrl('auth.signup')).form({
      username: user.username,
      email: user.email,
      password: 'Password!01'
    }).redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/')

    const dbUser = await User.findBy('username', user.username)
    assert.exists(await Profile.findBy('userId', dbUser?.id))
  })
})
