import HttpStatus from '#enums/http_statuses'
import { UserFactory } from '#factories/user_factory'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

test.group('Auth sign in', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('should sign in a user', async ({ client, route }) => {
    const user = await UserFactory.merge({ password: 'Password!01' }).with('profile').create()
    const response = await client
      .post(route('auth.signin.store'))
      .header('Referer', route('auth.signin'))
      .withCsrfToken()
      .form({
        uid: user.email,
        password: 'Password!01',
      })

    response.assertStatus(HttpStatus.OK)
    response.assertRedirectsTo(route('home'))
  })

  test('should fail to sign in a user with invalid credentials', async ({ client, route }) => {
    const user = await UserFactory.merge({ password: 'Password!01' }).with('profile').create()

    const response = await client
      .post(route('auth.signin.store'))
      .header('Referer', route('auth.signin'))
      .withCsrfToken()
      .form({
        uid: user.email,
        password: 'Password!02',
      })

    response.assertStatus(HttpStatus.OK)
    response.assertRedirectsTo(route('auth.signin'))
    response.assertTextIncludes('Invalid user credentials')
  })

  test('should fail to sign in a user with invalid payload', async ({ client, route }) => {
    const user = await UserFactory.merge({ password: 'Password!01' }).create()

    const response = await client
      .post(route('auth.signin.store'))
      .header('Referer', route('auth.signin'))
      .withCsrfToken()
      .form({
        email: user.email, // expected field is 'uid'
        password: 'Password!01',
      })

    response.assertStatus(HttpStatus.OK)
    response.assertRedirectsTo(route('auth.signin'))
  })

  test('should redirect authenticated user away from sign in page', async ({ client, route }) => {
    const user = await UserFactory.merge({ password: 'Password!01' }).create()
    const response = await client
      .get(route('auth.signin'))
      .header('Referer', route('auth.signin'))
      .withCsrfToken()
      .sessionLoginAs(user)

    response.assertRedirectsTo(route('home'))
    response.assertTextIncludes('You are already signed in')
  })
})
