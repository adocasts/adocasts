import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'
import HttpStatus from 'App/Enums/HttpStatus'
import { PostFactory } from 'Database/factories/PostFactory'
import { UserFactory } from 'Database/factories/UserFactory'
import HistoryService from 'App/Services/HistoryService'
import PostService from 'App/Services/PostService'
import WatchlistService from 'App/Services/WatchlistService'
import Watchlist from 'App/Models/Watchlist'

test.group('Posts action', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('should be able to mark a lesson as complete', async ({ client, assert }) => {
    const user = await UserFactory.with('profile').create()
    const post = await PostFactory.with('authors', 1, user => user.with('profile')).create()
    const response = await client.patch(`/histories/progression/toggle`).withCsrfToken().loginAs(user).form({
      postId: post.id,
      route: 'lessons.show'
    })

    const progression = await HistoryService.getPostProgression(user, post)

    response.assertStatus(HttpStatus.OK)
    response.assertTextIncludes("Completed")

    assert.isTrue(progression?.isCompleted)
  })

  test('should be able to mark a lesson as incomplete', async ({ client, assert }) => {
    const user = await UserFactory.with('profile').create()
    const post = await PostFactory.with('authors', 1, user => user.with('profile')).create()

    const history = await HistoryService.toggleComplete(user, 'lessons.show', { postId: post.id })

    assert.isTrue(history.isCompleted)

    const response = await client.patch(`/histories/progression/toggle`).withCsrfToken().loginAs(user).form({
      postId: post.id,
      route: 'lessons.show'
    })

    const progression = await HistoryService.getPostProgression(user, post)

    response.assertStatus(HttpStatus.OK)
    response.assertTextIncludes("Mark Complete")

    assert.isFalse(progression?.isCompleted)
  })

  test('should be able to add a lesson to watchlist', async ({ client }) => {
    const user = await UserFactory.with('profile').create()
    const post = await PostFactory.with('authors', 1, user => user.with('profile')).create()
    
    const response = await client.patch('/watchlist/posts/toggle').withCsrfToken().loginAs(user).form({
      postId: post.id
    })

    response.assertStatus(HttpStatus.OK)
    response.assertTextIncludes('In Your Watchlist')
  })

  test('should be able to remove a lesson from watchlist', async ({ client, assert }) => {
    const user = await UserFactory.with('profile').create()
    const post = await PostFactory.with('authors', 1, user => user.with('profile')).create()

    const [watchlist] = await WatchlistService.toggle(user, { postId: post.id })

    assert.instanceOf(watchlist, Watchlist)
    
    const response = await client.patch('/watchlist/posts/toggle').withCsrfToken().loginAs(user).form({
      postId: post.id
    })

    response.assertStatus(HttpStatus.OK)
    response.assertTextIncludes('Add to Watchlist')
  })
})