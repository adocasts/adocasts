import HttpStatus from '#enums/http_statuses'
import { PostFactory } from '#factories/post_factory'
import { UserFactory } from '#factories/user_factory'
import CommentVote from '#models/comment_vote'
import Comment from '#models/comment'
import Notification from '#models/notification'
import emitter from '@adonisjs/core/services/emitter'
import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import NotificationTypes from '#enums/notification_types'

test.group('Comments actions', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('can like a comment', async ({ client, route, assert }) => {
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile'))
      .with('comments', 1, (comments) =>
        comments.with('user', 1, (commenter) => commenter.with('profile'))
      )
      .create()
    const comment = post.comments.at(0)!
    const user = await UserFactory.with('profile').create()
    const pageUrl = route('lessons.show', { slug: post.slug })

    const response = await client
      .patch(route('comments.vote', { id: comment.id }))
      .header('referer', pageUrl)
      .withCsrfToken()
      .sessionLoginAs(user)

    const like = await comment.related('userVotes').query().count('*', 'count').firstOrFail()

    response.assertStatus(HttpStatus.OK)
    response.assertTextIncludes(`<span class="btn-count">${like.$extras.count}</span>`)

    assert.equal(like.$extras.count, 1)
  })

  test('can unlike a comment', async ({ client, route, assert }) => {
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile'))
      .with('comments', 1, (comments) =>
        comments.with('user', 1, (commenter) => commenter.with('profile'))
      )
      .create()
    const comment = post.comments.at(0)!
    const user = await UserFactory.with('profile').create()
    const pageUrl = route('lessons.show', { slug: post.slug })

    await CommentVote.create({ userId: user.id, commentId: comment.id })

    const response = await client
      .patch(route('comments.vote', { id: comment.id }))
      .header('referer', pageUrl)
      .withCsrfToken()
      .sessionLoginAs(user)

    const like = await comment.related('userVotes').query().count('*', 'count').firstOrFail()

    response.assertStatus(HttpStatus.OK)
    response.assertTextIncludes(`<span class="btn-count">${like.$extras.count}</span>`)

    assert.equal(like.$extras.count, 0)
  })

  test('user should receive notification and email when a user replies to their comment', async ({
    client,
    route,
    assert,
  }) => {
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile'))
      .with('comments', 1, (comments) =>
        comments.with('user', 1, (commenter) => commenter.with('profile'))
      )
      .create()
    const user = await UserFactory.with('profile').create()
    const comment = post.comments.at(0)!
    const pageUrl = route('lessons.show', { slug: post.slug })
    const events = emitter.fake()

    await comment.load('user', (query) => query.preload('profile'))
    await client
      .post(route('comments.store'))
      .header('referer', pageUrl)
      .withCsrfToken()
      .sessionLoginAs(user)
      .form({
        replyTo: comment.id,
        rootParentId: comment.id,
        postId: post.id,
        levelIndex: 0,
        body: 'This is a comment',
      })

    const commentReply = await Comment.query().orderBy('createdAt', 'desc').firstOrFail()
    const notification = await Notification.query().orderBy('createdAt', 'desc').firstOrFail()

    events.assertEmitted('notification:send')

    assert.equal(commentReply.replyTo, comment.id)
    assert.isTrue(comment.user.profile.emailOnCommentReply)
    assert.equal(notification.initiatorUserId, user.id)
    assert.equal(notification.userId, comment.user.id)
    assert.equal(notification.table, Comment.table)
    assert.equal(notification.tableId, commentReply.id)
  })

  test('user should receive notification and not email when a user replies to their comment and setting is off', async ({
    client,
    route,
    assert,
  }) => {
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile'))
      .with('comments', 1, (comments) =>
        comments.with('user', 1, (commenter) => commenter.with('profile'))
      )
      .create()
    const user = await UserFactory.with('profile').create()
    const comment = post.comments.at(0)!
    const pageUrl = route('lessons.show', { slug: post.slug })
    const events = emitter.fake()

    await comment.load('user', (query) => query.preload('profile'))
    await comment.user.profile.merge({ emailOnCommentReply: false }).save()

    await client
      .post(route('comments.store'))
      .header('referer', pageUrl)
      .withCsrfToken()
      .sessionLoginAs(user)
      .form({
        replyTo: comment.id,
        rootParentId: comment.id,
        postId: post.id,
        levelIndex: 1,
        body: 'This is a comment',
      })

    const commentReply = await Comment.query().orderBy('createdAt', 'desc').firstOrFail()
    const notification = await Notification.query().orderBy('createdAt', 'desc').firstOrFail()

    events.assertNotEmitted('notification:send')

    assert.equal(commentReply.replyTo, comment.id)
    assert.isFalse(comment.user.profile.emailOnCommentReply)
    assert.equal(notification.initiatorUserId, user.id)
    assert.equal(notification.userId, comment.user.id)
    assert.equal(notification.table, Comment.table)
    assert.equal(notification.tableId, commentReply.id)
  })

  test('user should receive mention notification and email when a user mentions another user in their comment', async ({
    client,
    route,
    assert,
  }) => {
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile')).create()
    const user = await UserFactory.with('profile').create()
    const userMentioned = await UserFactory.with('profile').create()
    const pageUrl = route('lessons.show', { slug: post.slug })
    const events = emitter.fake()

    await userMentioned.load('profile')
    await client
      .post(route('comments.store'))
      .header('referer', pageUrl)
      .withCsrfToken()
      .sessionLoginAs(user)
      .form({
        postId: post.id,
        levelIndex: 0,
        body: `<p>Hey <a data-type="mention" href="/${userMentioned.handle}" up-follow="true" class="mention" data-id="${userMentioned.username}" contenteditable="false">${userMentioned.handle}</a>! I'm mentioning you in my comment.</p>`,
      })

    const comment = await Comment.query().orderBy('createdAt', 'desc').firstOrFail()
    const notification = await Notification.query()
      .where('notificationTypeId', NotificationTypes.MENTION)
      .orderBy('createdAt', 'desc')
      .firstOrFail()

    events.assertEmitted('notification:send', (finder) => finder.data.user.id === userMentioned.id)

    assert.isTrue(userMentioned.profile.emailOnMention)
    assert.equal(notification.initiatorUserId, user.id)
    assert.equal(notification.userId, userMentioned.id)
    assert.equal(notification.table, Comment.table)
    assert.equal(notification.tableId, comment.id)
  })

  test('user should receive mention notification and not email when a user mentions another user in their comment and setting turned off', async ({
    client,
    route,
    assert,
  }) => {
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile')).create()
    const user = await UserFactory.with('profile').create()
    const userMentioned = await UserFactory.with('profile').create()
    const pageUrl = route('lessons.show', { slug: post.slug })
    const events = emitter.fake()

    await userMentioned.load('profile')
    await userMentioned.profile.merge({ emailOnMention: false }).save()
    await client
      .post(route('comments.store'))
      .header('referer', pageUrl)
      .withCsrfToken()
      .sessionLoginAs(user)
      .form({
        postId: post.id,
        levelIndex: 0,
        body: `<p>Hey <a data-type="mention" href="/${userMentioned.handle}" up-follow="true" class="mention" data-id="${userMentioned.username}" contenteditable="false">${userMentioned.handle}</a>! I'm mentioning you in my comment.</p>`,
      })

    const comment = await Comment.query().orderBy('createdAt', 'desc').firstOrFail()
    const notification = await Notification.query()
      .where('notificationTypeId', NotificationTypes.MENTION)
      .orderBy('createdAt', 'desc')
      .firstOrFail()

    events.assertNotEmitted(
      'notification:send',
      (finder) => finder.data.user.id === userMentioned.id
    )

    assert.isFalse(userMentioned.profile.emailOnMention)
    assert.equal(notification.initiatorUserId, user.id)
    assert.equal(notification.userId, userMentioned.id)
    assert.equal(notification.table, Comment.table)
    assert.equal(notification.tableId, comment.id)
  })
})
