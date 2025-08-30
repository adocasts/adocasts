import { PostFactory } from '#factories/post_factory'
import { UserFactory } from '#factories/user_factory'
import parser from '#services/parser_service'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

test.group('Posts view', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('should be able to view a published lesson', async ({ client, route }) => {
    const post = await PostFactory.with('authors', 1, (user) => user.with('profile')).create()
    const body = await parser.highlight(post.body!)
    const response = await client.get(route('lessons.show', { slug: post.slug }))

    response.assertOk()
    response.assertTextIncludes(body)
  })

  test('should be able to view an unlisted lesson', async ({ client, route }) => {
    const post = await PostFactory.with('authors', 1, (user) => user.with('profile'))
      .apply('unlisted')
      .create()

    const body = await parser.highlight(post.body!)
    const response = await client.get(route('lessons.show', { slug: post.slug }))

    response.assertOk()
    response.assertTextIncludes(body)
  })

  test('should not be able to view a future dated lesson', async ({ client, route }) => {
    const post = await PostFactory.with('authors', 1, (user) => user.with('profile'))
      .apply('futureDated')
      .create()
    const response = await client.get(route('lessons.show', { slug: post.slug }))

    response.assertOk()
    response.assertTextIncludes('| Coming Soon |')
  })

  test('should be able to view a future dated lesson as admin', async ({ client, route }) => {
    const user = await UserFactory.with('profile').apply('admin').create()
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile'))
      .apply('futureDated')
      .create()

    const body = await parser.highlight(post.body!)
    const response = await client
      .get(route('lessons.show', { slug: post.slug }))
      .sessionLoginAs(user)

    response.assertOk()
    response.assertTextIncludes(body)
  })

  test('should be able to view a future dated lesson as contributor lvl 2', async ({
    client,
    route,
  }) => {
    const user = await UserFactory.with('profile').apply('contributorLvl2').create()
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile'))
      .apply('futureDated')
      .create()

    const body = await parser.highlight(post.body!)
    const response = await client
      .get(route('lessons.show', { slug: post.slug }))
      .sessionLoginAs(user)

    response.assertOk()
    response.assertTextIncludes(body)
  })

  test('should be able to view a future dated lesson as contributor lvl 1', async ({
    client,
    route,
  }) => {
    const user = await UserFactory.with('profile').apply('contributorLvl1').create()
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile'))
      .apply('futureDated')
      .create()

    const body = await parser.highlight(post.body!)
    const response = await client
      .get(route('lessons.show', { slug: post.slug }))
      .sessionLoginAs(user)

    response.assertOk()
    response.assertTextIncludes(body)
  })

  test('should not be able to view a future dated unlisted lesson', async ({ client, route }) => {
    const post = await PostFactory.with('authors', 1, (user) => user.with('profile'))
      .apply('futureDated')
      .apply('unlisted')
      .create()

    const response = await client.get(route('lessons.show', { slug: post.slug }))

    response.assertOk()
    response.assertTextIncludes('| Coming Soon |')
  })

  test('should not be able to view a private lesson', async ({ client, route }) => {
    const post = await PostFactory.with('authors', 1, (user) => user.with('profile'))
      .apply('private')
      .create()

    const response = await client.get(route('lessons.show', { slug: post.slug }))

    response.assertNotFound()
  })

  test('should not be able to view a paywalled lesson as unauthenticated user', async ({
    client,
    route,
  }) => {
    const post = await PostFactory.with('authors', 1, (user) => user.with('profile'))
      .apply('paywalled')
      .create()

    const response = await client.get(route('lessons.show', { slug: post.slug }))

    response.assertOk()
    response.assertTextIncludes('Ready to get started?')
  })

  test('should not be able to view a paywalled lesson as authenticated free user', async ({
    client,
    route,
  }) => {
    const user = await UserFactory.with('profile').create()
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile'))
      .apply('paywalled')
      .create()

    const response = await client
      .get(route('lessons.show', { slug: post.slug }))
      .sessionLoginAs(user)

    response.assertOk()
    response.assertTextIncludes('Ready to get started?')
  })

  test('should be able to view a paywalled lesson as authenticated plus monthly user', async ({
    client,
    route,
  }) => {
    const user = await UserFactory.with('profile').apply('plusMonthly').create()
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile'))
      .apply('paywalled')
      .create()

    const body = await parser.highlight(post.body!)
    const response = await client
      .get(route('lessons.show', { slug: post.slug }))
      .sessionLoginAs(user)

    response.assertOk()
    response.assertTextIncludes(body)
  })

  test('should be able to view a paywalled lesson as authenticated plus annual user', async ({
    client,
    route,
  }) => {
    const user = await UserFactory.with('profile').apply('plusAnnually').create()
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile'))
      .apply('paywalled')
      .create()

    const body = await parser.highlight(post.body!)
    const response = await client
      .get(route('lessons.show', { slug: post.slug }))
      .sessionLoginAs(user)

    response.assertOk()
    response.assertTextIncludes(body)
  })

  test('should be able to view a paywalled lesson as authenticated plus forever user', async ({
    client,
    route,
  }) => {
    const user = await UserFactory.with('profile').apply('plusForever').create()
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile'))
      .apply('paywalled')
      .create()

    const body = await parser.highlight(post.body!)
    const response = await client
      .get(route('lessons.show', { slug: post.slug }))
      .sessionLoginAs(user)

    response.assertOk()
    response.assertTextIncludes(body)
  })
})
