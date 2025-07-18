import HttpStatus from '#enums/http_statuses'
import { UserFactory } from '#factories/user_factory'
import emitter from '@adonisjs/core/services/emitter'
import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

test.group('Auth password', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('should send forgot password email', async ({ client, route }) => {
    const events = emitter.fake()
    const user = await UserFactory.merge({ password: 'Password!01' }).create()

    const response = await client.post(route('auth.password.forgot.send')).withCsrfToken().form({
      email: user.email,
    })

    events.assertEmitted('email:password_reset')

    response.assertStatus(HttpStatus.OK)
    response.assertRedirectsTo(route('auth.password.forgot.sent'))
  })

  test('should appear to succeed if provided email does not exist', async ({ client, route }) => {
    const events = emitter.fake()
    const response = await client
      .post(route('auth.password.forgot.send'))
      .header('Referer', '/contact')
      .withCsrfToken()
      .form({
        email: 'no@adocasts.com',
      })

    events.assertNotEmitted('email:password_reset')

    response.assertStatus(HttpStatus.OK)
    response.assertRedirectsTo(route('auth.password.forgot.sent'))
  })

  test('should allow for password to be reset', async ({ client, route }) => {
    const events = emitter.fake()
    const user = await UserFactory.merge({ password: 'Password!01' }).create()

    const response = await client
      .post(route('auth.password.reset.store'))
      .withCsrfToken()
      .form({
        token: await hash.make(user.email),
        email: user.email,
        password: 'Password!02',
      })
      .redirects(0)

    events.assertEmitted('email:password_reset_success')

    response.assertStatus(HttpStatus.FOUND)
    response.assertHeader('location', route('home'))
    response.assertFlashMessage('toasts', [
      { type: 'success', message: 'Your password has been successfully reset' },
    ])
  })

  test('should not allow for password to be reset with invalid token', async ({
    client,
    route,
  }) => {
    const events = emitter.fake()
    const user = await UserFactory.merge({ password: 'Password!01' }).create()

    const response = await client
      .post(route('auth.password.reset.store'))
      .header('Referer', route('contact'))
      .withCsrfToken()
      .form({
        token: (await hash.make(user.email)) + '1',
        email: user.email,
        password: 'Password!02',
      })
      .redirects(0)

    events.assertNotEmitted('email:password_reset_success')

    response.assertStatus(HttpStatus.FOUND)
    response.assertHeader('location', route('contact'))
    response.assertFlashMessage('toasts', [
      {
        type: 'error',
        message: 'Something went wrong and we may not have been able to reset your password.',
      },
    ])
  })
})
