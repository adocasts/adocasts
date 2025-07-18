import HttpStatus from '#enums/http_statuses'
import { DiscussionFactory } from '#factories/discussion_factory'
import { UserFactory } from '#factories/user_factory'
import Comment from '#models/comment'
import Notification from '#models/notification'
import emitter from '@adonisjs/core/services/emitter'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

test.group('Comments discussions', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('can create a discussion comment', async ({ client, route }) => {
    const user = await UserFactory.with('profile').create()
    const discussion = await DiscussionFactory.with('user', 1, (query) =>
      query.with('profile')
    ).create()
    const pageUrl = route('discussions.show', { slug: discussion.slug })

    const response = await client
      .post(route('comments.store'))
      .header('referer', pageUrl)
      .withCsrfToken()
      .sessionLoginAs(user)
      .form({
        discussionId: discussion.id,
        levelIndex: 0,
        body: 'This is a comment',
      })
      .redirects(0)

    const latestComment = await Comment.query().orderBy('createdAt', 'desc').firstOrFail()

    response.assertFound()
    response.assertToast('success', 'Thanks for your comment!')
    response.assertHeader('location', pageUrl + `#comment${latestComment.id}`)
  })

  test('can reply a discussion comment', async ({ client, route, assert }) => {
    const user = await UserFactory.with('profile').create()
    const discussion = await DiscussionFactory.with('user', 1, (query) => query.with('profile'))
      .with('comments', 1, (comments) =>
        comments.with('user', 1, (commenter) => commenter.with('profile'))
      )
      .create()

    const pageUrl = route('discussions.show', { slug: discussion.slug })
    const comment = discussion.comments.at(0)!

    const response = await client
      .post(route('comments.store'))
      .header('referer', pageUrl)
      .withCsrfToken()
      .sessionLoginAs(user)
      .form({
        replyTo: comment.id,
        rootParentId: comment.id,
        discussionId: discussion.id,
        levelIndex: 1,
        body: 'This is a comment',
      })
      .redirects(0)

    const latestComment = await Comment.query().orderBy('createdAt', 'desc').firstOrFail()

    assert.equal(latestComment.replyTo, comment.id)

    response.assertFound()
    response.assertToast('success', 'Thanks for your comment!')
    response.assertHeader('location', pageUrl + `#comment${latestComment.id}`)
  })

  test('can update a discussion comment', async ({ client, route, assert }) => {
    const discussion = await DiscussionFactory.with('user', 1, (query) => query.with('profile'))
      .with('comments', 1, (comments) =>
        comments.with('user', 1, (commenter) => commenter.with('profile'))
      )
      .create()

    const comment = discussion.comments.at(0)!
    const user = comment.user!
    const pageUrl = route('discussions.show', { slug: discussion.slug })

    const response = await client
      .put(route('comments.update', { id: comment.id }))
      .header('referer', pageUrl)
      .withCsrfToken()
      .sessionLoginAs(user)
      .form({
        body: 'This is an updated comment',
      })
      .redirects(0)

    await comment.refresh()

    response.assertFound()
    response.assertToast('success', 'Your comment has been updated')
    response.assertHeader('location', pageUrl)

    assert.equal(comment.body, 'This is an updated comment')
  })

  test('can delete a discussion comment', async ({ client, route, assert }) => {
    const discussion = await DiscussionFactory.with('user', 1, (query) => query.with('profile'))
      .with('comments', 1, (comments) =>
        comments.with('user', 1, (commenter) => commenter.with('profile'))
      )
      .create()

    const comment = discussion.comments.at(0)!
    const user = comment.user!
    const pageUrl = route('discussions.show', { slug: discussion.slug })

    const response = await client
      .delete(route('comments.destroy', { id: comment.id }))
      .header('referer', pageUrl)
      .withCsrfToken()
      .sessionLoginAs(user)
      .redirects(0)

    const check = await Comment.find(comment.id)

    response.assertFound()
    response.assertToast('success', 'Your comment has been deleted')
    response.assertHeader('location', pageUrl)

    assert.isNull(check)
  })

  test('poster should receive notification and email when a user comments on their discussion', async ({
    client,
    route,
    assert,
  }) => {
    const discussion = await DiscussionFactory.with('user', 1, (query) =>
      query.with('profile')
    ).create()
    const user = await UserFactory.with('profile').create()
    const poster = discussion.user
    const pageUrl = route('discussions.show', { slug: discussion.slug })
    const events = emitter.fake()

    await poster.load('profile')
    await client
      .post(route('comments.store'))
      .header('referer', pageUrl)
      .withCsrfToken()
      .sessionLoginAs(user)
      .form({
        discussionId: discussion.id,
        levelIndex: 0,
        body: 'This is a comment',
      })
      .redirects(0)

    const comment = await Comment.query().orderBy('createdAt', 'desc').firstOrFail()
    const notification = await Notification.query().orderBy('createdAt', 'desc').firstOrFail()

    events.assertEmitted('notification:send')

    assert.isTrue(poster.profile.emailOnComment)
    assert.equal(notification.initiatorUserId, user.id)
    assert.equal(notification.userId, poster.id)
    assert.equal(notification.table, Comment.table)
    assert.equal(notification.tableId, comment.id)
  })

  test('author should receive notification and not email when a user comments on their post and setting turn off', async ({
    client,
    route,
    assert,
  }) => {
    const discussion = await DiscussionFactory.with('user', 1, (query) =>
      query.with('profile')
    ).create()
    const user = await UserFactory.with('profile').create()
    const poster = discussion.user
    const pageUrl = route('discussions.show', { slug: discussion.slug })
    const events = emitter.fake()

    await poster.load('profile')
    await poster.profile.merge({ emailOnComment: false }).save()

    await client
      .post(route('comments.store'))
      .header('referer', pageUrl)
      .withCsrfToken()
      .sessionLoginAs(user)
      .form({
        discussionId: discussion.id,
        levelIndex: 0,
        body: 'This is a comment',
      })
      .redirects(0)

    const comment = await Comment.query().orderBy('createdAt', 'desc').firstOrFail()
    const notification = await Notification.query().orderBy('createdAt', 'desc').firstOrFail()

    events.assertNotEmitted('notification:send')

    assert.isFalse(poster.profile.emailOnComment)
    assert.equal(notification.initiatorUserId, user.id)
    assert.equal(notification.userId, poster.id)
    assert.equal(notification.table, Comment.table)
    assert.equal(notification.tableId, comment.id)
  })
})
