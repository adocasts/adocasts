import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'
import HttpStatus from 'App/Enums/HttpStatus'
import { PostFactory } from 'Database/factories/PostFactory'
import PostService from 'App/Services/PostService'
import { UserFactory } from 'Database/factories/UserFactory'

test.group('Posts view', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('should be able to view a published lesson', async ({ client }) => {
    const post = await PostFactory.with('authors', 1, user => user.with('profile')).create()
    const forDisplay = await PostService.getBySlug(post.slug, post.postTypeId)
    const response = await client.get(`/lessons/${post.slug}`)

    response.assertStatus(HttpStatus.OK)
    response.assertTextIncludes(forDisplay.body!)
  })

  test('should be able to view an unlisted lesson', async ({ client }) => {
    const post = await PostFactory.with('authors', 1, user => user.with('profile')).apply('unlisted').create()
    const forDisplay = await PostService.getBySlug(post.slug, post.postTypeId)
    const response = await client.get(`/lessons/${post.slug}`)

    response.assertStatus(HttpStatus.OK)
    response.assertTextIncludes(forDisplay.body!)
  })

  test('should not be able to view a future dated lesson', async ({ client }) => {
    const post = await PostFactory.with('authors', 1, user => user.with('profile')).apply('futureDated').create()
    const response = await client.get(`/lessons/${post.slug}`)

    response.assertStatus(HttpStatus.OK)
    response.assertTextIncludes("This Lesson Is Coming Soon")
  })

  test('should be able to view a future dated lesson as admin', async ({ client }) => {
    const user = await UserFactory.with('profile').apply('admin').create()
    const post = await PostFactory.with('authors', 1, user => user.with('profile')).apply('futureDated').create()
    const forDisplay = await PostService.getBySlug(post.slug, post.postTypeId)
    const response = await client.get(`/lessons/${post.slug}`).loginAs(user)

    response.assertStatus(HttpStatus.OK)
    response.assertTextIncludes(forDisplay.body!)
  })

  test('should be able to view a future dated lesson as contributor lvl 2', async ({ client }) => {
    const user = await UserFactory.with('profile').apply('contributorLvl2').create()
    const post = await PostFactory.with('authors', 1, user => user.with('profile')).apply('futureDated').create()
    const forDisplay = await PostService.getBySlug(post.slug, post.postTypeId)
    const response = await client.get(`/lessons/${post.slug}`).loginAs(user)

    response.assertStatus(HttpStatus.OK)
    response.assertTextIncludes(forDisplay.body!)
  })

  test('should be able to view a future dated lesson as contributor lvl 1', async ({ client }) => {
    const user = await UserFactory.with('profile').apply('contributorLvl1').create()
    const post = await PostFactory.with('authors', 1, user => user.with('profile')).apply('futureDated').create()
    const forDisplay = await PostService.getBySlug(post.slug, post.postTypeId)
    const response = await client.get(`/lessons/${post.slug}`).loginAs(user)

    response.assertStatus(HttpStatus.OK)
    response.assertTextIncludes(forDisplay.body!)
  })

  test('should not be able to view a future dated unlisted lesson', async ({ client }) => {
    const post = await PostFactory.with('authors', 1, user => user.with('profile')).apply('futureDated').apply('unlisted').create()
    const response = await client.get(`/lessons/${post.slug}`)

    response.assertStatus(HttpStatus.OK)
    response.assertTextIncludes("This Lesson Is Coming Soon")
  })

  test('should not be able to view a private lesson', async ({ client }) => {
    const post = await PostFactory.with('authors', 1, user => user.with('profile')).apply('private').create()
    const response = await client.get(`/lessons/${post.slug}`)

    response.assertStatus(HttpStatus.NOT_FOUND)
  })

  test('should not be able to view a paywalled lesson as unauthenticated user', async ({ client }) => {
    const post = await PostFactory.with('authors', 1, user => user.with('profile')).apply('paywalled').create()
    const response = await client.get(`/lessons/${post.slug}`)

    response.assertStatus(HttpStatus.OK)
    response.assertTextIncludes("Ready to get started?")
  })

  test('should not be able to view a paywalled lesson as authenticated free user', async ({ client }) => {
    const user = await UserFactory.with('profile').create()
    const post = await PostFactory.with('authors', 1, user => user.with('profile')).apply('paywalled').create()
    const response = await client.get(`/lessons/${post.slug}`).loginAs(user)

    response.assertStatus(HttpStatus.OK)
    response.assertTextIncludes("Ready to get started?")
  })

  test('should be able to view a paywalled lesson as authenticated plus monthly user', async ({ client }) => {
    const user = await UserFactory.with('profile').apply('plusMonthly').create()
    const post = await PostFactory.with('authors', 1, user => user.with('profile')).apply('paywalled').create()
    const forDisplay = await PostService.getBySlug(post.slug, post.postTypeId)
    const response = await client.get(`/lessons/${post.slug}`).loginAs(user)

    response.assertStatus(HttpStatus.OK)
    response.assertTextIncludes(forDisplay.body!)
  })

  test('should be able to view a paywalled lesson as authenticated plus annual user', async ({ client }) => {
    const user = await UserFactory.with('profile').apply('plusAnnually').create()
    const post = await PostFactory.with('authors', 1, user => user.with('profile')).apply('paywalled').create()
    const forDisplay = await PostService.getBySlug(post.slug, post.postTypeId)
    const response = await client.get(`/lessons/${post.slug}`).loginAs(user)

    response.assertStatus(HttpStatus.OK)
    response.assertTextIncludes(forDisplay.body!)
  })

  test('should be able to view a paywalled lesson as authenticated plus forever user', async ({ client }) => {
    const user = await UserFactory.with('profile').apply('plusForever').create()
    const post = await PostFactory.with('authors', 1, user => user.with('profile')).apply('paywalled').create()
    const forDisplay = await PostService.getBySlug(post.slug, post.postTypeId)
    const response = await client.get(`/lessons/${post.slug}`).loginAs(user)

    response.assertStatus(HttpStatus.OK)
    response.assertTextIncludes(forDisplay.body!)
  })
})