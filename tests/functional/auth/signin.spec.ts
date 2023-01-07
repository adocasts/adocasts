import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'
import Route from '@ioc:Adonis/Core/Route'
import { UserFactory } from 'Database/factories'
import Env from '@ioc:Adonis/Core/Env'

test.group('Auth - Sign In', (group) => {
  const appUrl = `http://${Env.get('HOST')}:${Env.get('PORT')}`

  // Write your test here
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('an unauthenticated user can view the sign in page', async ({ client }) => {
    const response = await client.get(Route.makeUrl('auth.signin.show'))

    response.assertStatus(200)
    response.assertTextIncludes('Sign In')
  })

  test('an authenticated user gets redirected to home page', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const response = await client.get(Route.makeUrl('auth.signin.show')).loginAs(user)
    
    response.assertStatus(200)
    assert.equal(response.redirects()[0], `${appUrl}/`)
  })

  test('a user can sign in via email', async ({ client }) => {
    const user = await UserFactory.merge({ password: 'Password!01' }).create()
    const response = await client.post(Route.makeUrl('auth.signin')).form({
      uid: user.email,
      password: 'Password!01'
    }).redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/')
  })

  test('a user can sign in via username', async ({ client }) => {
    const user = await UserFactory.merge({ password: 'Password!01' }).create()
    const response = await client.post(Route.makeUrl('auth.signin')).form({
      uid: user.username,
      password: 'Password!01'
    }).redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/')
  })
})
