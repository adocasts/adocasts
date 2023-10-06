import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'
import { UserFactory } from 'Database/factories/UserFactory'
import HttpStatus from 'App/Enums/HttpStatus'
import Mail from '@ioc:Adonis/Addons/Mail'
import Route from '@ioc:Adonis/Core/Route'
import User from 'App/Models/User'

test.group('Auth email verification', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('should send email verification email', async ({ client, assert }) => {
    const mailer = Mail.fake()
    const user = await UserFactory.merge({ password: 'Password!01' }).create()

    const response = await client
      .post('/verification/email/send')
      .loginAs(user)
      .withCsrfToken()
      .header('Referer', '/contact')
      .form({})

    assert.isTrue(mailer.exists(mail => mail.subject === '[Adocasts] Please verify your email.'))

    response.assertStatus(HttpStatus.OK)
    response.assertRedirectsTo('/contact')

    Mail.restore()
  })

  test('should verify the users email', async ({ client, assert }) => {
    const user = await UserFactory.merge({ password: 'Password!01' }).create()
    const location = Route.makeSignedUrl('verification.email.verify', {
      email: user.email
    }, { 
      expiresIn: '24h', 
      purpose: 'email_verification' 
    })

    const response = await client.get(location).loginAs(user).redirects(0)

    response.assertStatus(HttpStatus.FOUND)
    response.assertHeader('location', '/')
    response.assertFlashMessage('success', 'Your email has been successfully verified, thank you!')

    const updatedUser = await User.findOrFail(user.id)

    assert.equal(updatedUser.emailVerified, user.email)
    assert.isNotNull(updatedUser.emailVerifiedAt)
  })

  test('should redirect to sign in page if not authenticated', async ({ client }) => {
    const user = await UserFactory.merge({ password: 'Password!01' }).create()
    const location = Route.makeSignedUrl('verification.email.verify', {
      email: user.email
    }, { 
      expiresIn: '24h', 
      purpose: 'email_verification' 
    })

    const response = await client.get(location).redirects(0)

    response.assertStatus(HttpStatus.FOUND)
    response.assertHeader('location', '/signin?action=email_verification')
    response.assertSession('email_verification', location)
  })
})