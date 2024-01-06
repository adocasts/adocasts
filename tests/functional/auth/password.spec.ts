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

    const response = await client.post('/forgot-password').form({
      email: user.email,
    })

    events.assertEmitted('email:password_reset')

    response.assertStatus(HttpStatus.OK)
    response.assertRedirectsTo(route('auth.password.forgot.sent'))
  })

  test('should gracefully error if provided email does not exist', async ({ client }) => {
    const response = await client
      .post('/forgot-password')
      .header('Referer', '/contact')
      .form({
        email: 'no@adocasts.com',
      })
      .redirects(0)

    response.assertStatus(HttpStatus.FOUND)
    response.assertHeader('location', '/contact')
    response.assertFlashMessage('error', "Account couldn't be found for this email")
  })

  test('should allow for password to be reset', async ({ client }) => {
    const user = await UserFactory.merge({ password: 'Password!01' }).create()

    const response = await client
      .post('/reset-password')
      .form({
        token: await hash.make(user.email),
        email: user.email,
        password: 'Password!02',
      })
      .redirects(0)

    response.assertStatus(HttpStatus.FOUND)
    response.assertHeader('location', '/')
    response.assertFlashMessage('success', 'Your password has been successfully reset')
  })

  test('should not allow for password to be reset with invalid token', async ({ client }) => {
    const user = await UserFactory.merge({ password: 'Password!01' }).create()

    const response = await client
      .post('/reset-password')
      .header('Referer', '/contact')
      .form({
        token: (await hash.make(user.email)) + '1',
        email: user.email,
        password: 'Password!02',
      })
      .redirects(0)

    response.assertStatus(HttpStatus.FOUND)
    response.assertHeader('location', '/contact')
    response.assertFlashMessage(
      'error',
      'Something went wrong and we may not have been able to reset your password.'
    )
  })
})
