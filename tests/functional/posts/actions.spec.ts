import TogglePostWatchlist from '#actions/posts/toggle_post_watchlist'
import { PostFactory } from '#factories/post_factory'
import { UserFactory } from '#factories/user_factory'
import Progress from '#models/progress'
import Watchlist from '#models/watchlist'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

test.group('Posts actions', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('should be able to mark a lesson as complete', async ({ client, assert, route }) => {
    const user = await UserFactory.with('profile').create()
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile')).create()
    const response = await client
      .patch(route('progress.toggle'))
      .withCsrfToken()
      .sessionLoginAs(user)
      .form({
        postId: post.id,
        route: 'lessons.show',
      })

    const progression = await Progress.findBy({ userId: user.id, postId: post.id })

    response.assertOk()
    response.assertTextIncludes('<span class="sr-only">Lesson Completed</span>')

    assert.isTrue(progression?.isCompleted)
  })

  test('should be able to mark a lesson as incomplete', async ({ client, assert, route }) => {
    const user = await UserFactory.with('profile').create()
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile')).create()

    const history = await Progress.create({
      userId: user.id,
      postId: post.id,
      isCompleted: true,
    })

    assert.isTrue(history.isCompleted)

    const response = await client
      .patch(route('progress.toggle'))
      .withCsrfToken()
      .sessionLoginAs(user)
      .form({
        postId: post.id,
        route: 'lessons.show',
      })

    const progression = await Progress.findBy({ userId: user.id, postId: post.id })

    response.assertOk()
    response.assertTextIncludes('<span class="sr-only">Lesson Incomplete</span>')

    assert.isFalse(progression?.isCompleted)
  })

  test('should be able to add a lesson to watchlist', async ({ client, route }) => {
    const user = await UserFactory.with('profile').create()
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile')).create()

    const response = await client
      .patch(route('lessons.watchlist', { slug: post.slug }))
      .withCsrfToken()
      .sessionLoginAs(user)
      .form({})

    response.assertOk()
    response.assertTextIncludes('<span class="sr-only">Lesson Is Bookmarked</span>')
  })

  test('should be able to remove a lesson from watchlist', async ({ client, assert, route }) => {
    const user = await UserFactory.with('profile').create()
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile')).create()

    const { watchlist } = await TogglePostWatchlist.run(user, post.id)

    assert.instanceOf(watchlist, Watchlist)

    const response = await client
      .patch(route('lessons.watchlist', { slug: post.slug }))
      .withCsrfToken()
      .sessionLoginAs(user)
      .form({})

    response.assertOk()
    response.assertTextIncludes('<span class="sr-only">Bookmark This Lesson</span>')
  })

  test('should be able to track post progression', async ({ client, route }) => {
    const user = await UserFactory.with('profile').create()
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile')).create()

    const response = await client
      .post(route('progress.store'))
      .withCsrfToken()
      .sessionLoginAs(user)
      .form({
        postId: post.id,
        route: 'lessons.show',
        watchSeconds: 60,
        watchPercent: 50,
      })

    response.assertOk()
    response.assertBodyContains({ success: true })
  })

  test('should be able to update post progression', async ({ client, route, assert }) => {
    const user = await UserFactory.with('profile').create()
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile')).create()
    const history = await Progress.create({
      userId: user.id,
      postId: post.id,
      isCompleted: false,
      watchSeconds: 10,
      watchPercent: 20,
    })

    const response = await client
      .post(route('progress.store'))
      .withCsrfToken()
      .sessionLoginAs(user)
      .form({
        postId: post.id,
        route: 'lessons.show',
        watchSeconds: 60,
        watchPercent: 50,
      })

    await history.refresh()

    response.assertOk()
    response.assertBodyContains({ success: true })

    assert.equal(history.watchSeconds, 60)
    assert.equal(history.watchPercent, 50)
  })
})
