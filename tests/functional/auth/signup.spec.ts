import HttpStatus from '#enums/http_statuses'
import { UserFactory } from '#factories/user_factory'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

test.group('Auth signup', (group) => {
  group.each.setup(async () => {
    // testUtils.db().truncate()
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('should sign up a user', async ({ client, route }) => {
    const response = await client
      .post(route('auth.signup.store'))
      .header('Referer', route('auth.signup'))
      .form({
        username: 'test',
        email: 'test@adocasts.com',
        password: 'Password!01',
      })
      .withCsrfToken()

    response.assertStatus(HttpStatus.OK)
    response.assertRedirectsTo(route('home'))
  })

  test('should fail to sign up a user when username is in use', async ({ client, route }) => {
    const user = await UserFactory.merge({ password: 'Password!01' }).create()

    const response = await client
      .post(route('auth.signup.store'))
      .header('Referer', route('auth.signup'))
      .form({
        username: user.username,
        email: 'test@adocasts.com',
        password: 'Password!01',
      })
      .withCsrfToken()

    response.assertStatus(HttpStatus.OK)
    response.assertRedirectsTo(route('auth.signup'))
    response.assertTextIncludes('The username has already been taken')
  })

  test('should fail to sign up a user when email is in use', async ({ client, route }) => {
    const user = await UserFactory.merge({ password: 'Password!01' }).create()
    const response = await client
      .post(route('auth.signup.store'))
      .header('Referer', route('auth.signup'))
      .form({
        username: 'test',
        email: user.email,
        password: 'Password!01',
      })
      .withCsrfToken()

    response.assertStatus(HttpStatus.OK)
    response.assertRedirectsTo(route('auth.signup'))
    response.assertTextIncludes('The email has already been taken')
  })

  test('should redirect authenticated user away from sign up page', async ({ client, route }) => {
    const user = await UserFactory.merge({ password: 'Password!01' }).with('profile').create()
    const response = await client
      .get(route('auth.signup'))
      .header('Referer', route('contact'))
      .sessionLoginAs(user)

    response.assertRedirectsTo(route('home'))
    response.assertTextIncludes('You are already signed in')
  })

  test('should have a profile created with sign up', async ({ client, assert, route }) => {
    const response = await client
      .post(route('auth.signup.store'))
      .form({
        username: 'test',
        email: 'test@adocasts.com',
        password: 'Password!01',
      })
      .withCsrfToken()

    response.assertStatus(HttpStatus.OK)

    const user = await User.findByOrFail('username', 'test')
    const profile = await user.related('profile').query().firstOrFail()

    assert.exists(profile)
  })
})
