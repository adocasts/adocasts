import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'
import { UserFactory } from 'Database/factories/UserFactory'
import HttpStatus from 'App/Enums/HttpStatus'

test.group('Auth sign in', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('should sign in a user', async ({ client }) => {
    const user = await UserFactory.merge({ password: 'Password!01' }).create()

    const response = await client.post('/signin').withCsrfToken().form({
      uid: user.email,
      password: 'Password!01',
    })

    response.assertStatus(HttpStatus.OK)
    response.assertRedirectsToRoute('home.index')
  })

  test('should fail to sign in a user with invalid credentials', async ({ client }) => {
    const user = await UserFactory.merge({ password: 'Password!01' }).create()

    const response = await client.post('/signin').withCsrfToken().form({
      uid: user.email,
      password: 'Password!02',
    })

    response.assertStatus(HttpStatus.OK)
    response.assertRedirectsToRoute('auth.signin')
    response.assertTextIncludes('The provided username/email or password is incorrect')
  })

  test('should fail to sign in a user with invalid payload', async ({ client }) => {
    const user = await UserFactory.merge({ password: 'Password!01' }).create()

    const response = await client.post('/signin').header('Referer', '/signin').withCsrfToken().form({
      email: user.email, // expected field is 'uid'
      password: 'Password!01'
    })

    response.assertStatus(HttpStatus.OK)
    response.assertRedirectsTo('/signin')
  })

  test('should redirect authenticated user away from sign in page', async ({ client }) => {
    const user = await UserFactory.merge({ password: 'Password!01' }).create()
    const response = await client.get('/signin').header('Referer', '/contact').loginAs(user)

    response.assertRedirectsTo('/contact')
    response.assertTextIncludes('You are already signed in')
  })
})