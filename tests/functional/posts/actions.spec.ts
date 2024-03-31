import HistoryTypes from '#enums/history_types'
import HttpStatus from '#enums/http_statuses'
import { PostFactory } from '#factories/post_factory'
import { UserFactory } from '#factories/user_factory'
import History from '#models/history'
import Progress from '#models/progress'
import Watchlist from '#models/watchlist'
import HistoryService from '#services/history_service'
import WatchlistService from '#services/watchlist_service'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

test.group('Posts actions', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('should be able to mark a lesson as complete', async ({ client, assert }) => {
    const user = await UserFactory.with('profile').create()
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile')).create()
    const response = await client
      .patch(`/histories/progression/toggle`)
      .withGuard('web')
      .loginAs(user)
      .form({
        postId: post.id,
        route: 'lessons.show',
      })

    const progression = await HistoryService.getPostProgression(user, post)

    response.assertStatus(HttpStatus.OK)
    response.assertTextIncludes('Completed')

    assert.isTrue(progression?.isCompleted)
  })

  test('should be able to mark a lesson as incomplete', async ({ client, assert }) => {
    const user = await UserFactory.with('profile').create()
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile')).create()

    const history = await Progress.create({
      userId: user.id,
      postId: post.id,
      isCompleted: true,
    })

    assert.isTrue(history.isCompleted)

    const response = await client
      .patch(`/histories/progression/toggle`)
      .withGuard('web')
      .loginAs(user)
      .form({
        postId: post.id,
        route: 'lessons.show',
      })

    const progression = await HistoryService.getPostProgression(user, post)

    response.assertStatus(HttpStatus.OK)
    response.assertTextIncludes('Mark As Completed')

    assert.isFalse(progression?.isCompleted)
  })

  test('should be able to add a lesson to watchlist', async ({ client }) => {
    const user = await UserFactory.with('profile').create()
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile')).create()

    const response = await client.patch('/watchlist/toggle').withGuard('web').loginAs(user).form({
      postId: post.id,
      fragment: 'components/watchlist/toggle.edge',
    })

    response.assertStatus(HttpStatus.OK)
    response.assertTextIncludes('In Watchlist')
  })

  test('should be able to remove a lesson from watchlist', async ({ client, assert }) => {
    const user = await UserFactory.with('profile').create()
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile')).create()

    const { watchlist } = await WatchlistService.toggle(user, { postId: post.id })

    assert.instanceOf(watchlist, Watchlist)

    const response = await client.patch('/watchlist/toggle').withGuard('web').loginAs(user).form({
      postId: post.id,
      fragment: 'components/watchlist/toggle.edge',
    })

    response.assertStatus(HttpStatus.OK)
    response.assertTextIncludes('Add to Watchlist')
  })

  test('should be able to track post progression', async ({ client, route }) => {
    const user = await UserFactory.with('profile').create()
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile')).create()

    const response = await client
      .post(route('api.histories.progression'))
      .withGuard('web')
      .loginAs(user)
      .form({
        postId: post.id,
        route: 'lessons.show',
        watchSeconds: 60,
        watchPercent: 50,
      })

    response.assertStatus(HttpStatus.OK)
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
      .post(route('api.histories.progression'))
      .withGuard('web')
      .loginAs(user)
      .form({
        postId: post.id,
        route: 'lessons.show',
        watchSeconds: 60,
        watchPercent: 50,
      })

    await history.refresh()

    response.assertStatus(HttpStatus.OK)
    response.assertBodyContains({ success: true })

    assert.equal(history.watchSeconds, 60)
    assert.equal(history.watchPercent, 50)
  })
})
