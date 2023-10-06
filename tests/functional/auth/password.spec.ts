import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'
import { UserFactory } from 'Database/factories/UserFactory'
import HttpStatus from 'App/Enums/HttpStatus'
import Mail from '@ioc:Adonis/Addons/Mail'
import Hash from '@ioc:Adonis/Core/Hash'

test.group('Auth forgot password', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('should send forgot password email', async ({ client, assert }) => {
    const mailer = Mail.fake()
    const user = await UserFactory.merge({ password: 'Password!01' }).create()

    const response = await client.post('/forgot-password').withCsrfToken().form({
      email: user.email,
    })

    assert.isTrue(mailer.exists(mail => mail.subject === '[Adocasts] Reset your password'))

    response.assertStatus(HttpStatus.OK)
    response.assertRedirectsToRoute('auth.password.forgot.sent')

    Mail.restore()
  })

  test('should gracefully error if provided email does not exist', async ({ client }) => {
    const response = await client.post('/forgot-password').header('Referer', '/contact').withCsrfToken().form({
      email: 'no@adocasts.com',
    }).redirects(0)

    response.assertStatus(HttpStatus.FOUND)
    response.assertHeader('location', '/contact')
    response.assertFlashMessage('error', "Account couldn't be found for this email")
  })

  test('should allow for password to be reset', async ({ client }) => {
    const user = await UserFactory.merge({ password: 'Password!01' }).create()

    const response = await client.post('/reset-password').withCsrfToken().form({
      token: await Hash.make(user.email),
      email: user.email,
      password: 'Password!02'
    }).redirects(0)

    response.assertStatus(HttpStatus.FOUND)
    response.assertHeader('location', '/')
    response.assertFlashMessage('success', 'Your password has been successfully reset')
  })

  test('should not allow for password to be reset with invalid token', async ({ client }) => {
    const user = await UserFactory.merge({ password: 'Password!01' }).create()

    const response = await client.post('/reset-password').header('Referer', '/contact').withCsrfToken().form({
      token: await Hash.make(user.email) + '1',
      email: user.email,
      password: 'Password!02'
    }).redirects(0)

    response.assertStatus(HttpStatus.FOUND)
    response.assertHeader('location', '/contact')
    response.assertFlashMessage('error', 'Something went wrong and we may not have been able to reset your password.')
  })
})