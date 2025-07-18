import HttpStatus from '#enums/http_statuses'
import { UserFactory } from '#factories/user_factory'
import User from '#models/user'
import emitter from '@adonisjs/core/services/emitter'
import router from '@adonisjs/core/services/router'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

test.group('Auth email verification', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('should send email verification email', async ({ client, route }) => {
    const events = emitter.fake()
    const user = await UserFactory.merge({ password: 'Password!01' }).create()

    const response = await client
      .post(route('verification.email.send'))
      .withCsrfToken()
      .sessionLoginAs(user)
      .header('Referer', route('contact'))
      .form({})

    events.assertEmitted('email:email_verification')

    response.assertStatus(HttpStatus.OK)
    response.assertRedirectsTo(route('contact'))
  })

  test('should verify the users email', async ({ client, assert, route }) => {
    const user = await UserFactory.merge({ password: 'Password!01' }).create()
    const location = router.makeSignedUrl(
      'verification.email.verify',
      {
        email: user.email,
      },
      {
        expiresIn: '24h',
        purpose: 'email_verification',
      }
    )

    const response = await client.get(location).sessionLoginAs(user).redirects(0)

    response.assertStatus(HttpStatus.FOUND)
    response.assertHeader('location', route('home'))
    response.assertFlashMessage('toasts', [
      { type: 'success', message: 'Your email has been successfully verified, thank you!' },
    ])

    const updatedUser = await User.findOrFail(user.id)

    assert.equal(updatedUser.emailVerified, user.email)
    assert.isNotNull(updatedUser.emailVerifiedAt)
  })

  test('should redirect to sign in page if not authenticated', async ({ client }) => {
    const user = await UserFactory.merge({ password: 'Password!01' }).with('profile').create()
    const location = router.makeSignedUrl(
      'verification.email.verify',
      {
        email: user.email,
      },
      {
        expiresIn: '24h',
        purpose: 'email_verification',
      }
    )

    const response = await client.get(location).redirects(0)

    response.assertStatus(HttpStatus.FOUND)
    response.assertHeader('location', '/signin?action=email_verification')
    response.assertSession('email_verification', location)
  })
})
