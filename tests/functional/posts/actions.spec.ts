import HistoryTypes from '#enums/history_types'
import HttpStatus from '#enums/http_statuses'
import { PostFactory } from '#factories/post_factory'
import { UserFactory } from '#factories/user_factory'
import History from '#models/history'
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
    const post = await PostFactory.with('authors', 1, (user) => user.with('profile')).create()
    const response = await client.patch(`/histories/progression/toggle`).loginAs(user).form({
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
    const post = await PostFactory.with('authors', 1, (user) => user.with('profile')).create()

    const history = await History.create({
      userId: user.id,
      postId: post.id,
      historyTypeId: HistoryTypes.PROGRESSION,
      route: 'lessons.show',
      isCompleted: true,
    })

    assert.isTrue(history.isCompleted)

    const response = await client.patch(`/histories/progression/toggle`).loginAs(user).form({
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
    const post = await PostFactory.with('authors', 1, (user) => user.with('profile')).create()

    const response = await client.patch('/watchlist/toggle').loginAs(user).form({
      postId: post.id,
      fragment: 'components/watchlist/toggle.edge',
    })

    response.assertStatus(HttpStatus.OK)
    response.assertTextIncludes('In Watchlist')
  })

  test('should be able to remove a lesson from watchlist', async ({ client, assert }) => {
    const user = await UserFactory.with('profile').create()
    const post = await PostFactory.with('authors', 1, (user) => user.with('profile')).create()

    const { watchlist } = await WatchlistService.toggle(user, { postId: post.id })

    assert.instanceOf(watchlist, Watchlist)

    const response = await client.patch('/watchlist/toggle').loginAs(user).form({
      postId: post.id,
      fragment: 'components/watchlist/toggle.edge',
    })

    response.assertStatus(HttpStatus.OK)
    response.assertTextIncludes('Add to Watchlist')
  })
})

