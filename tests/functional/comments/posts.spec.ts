import { PostFactory } from '#factories/post_factory'
import { UserFactory } from '#factories/user_factory'
import Comment from '#models/comment'
import Notification from '#models/notification'
import emitter from '@adonisjs/core/services/emitter'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

test.group('Comment Posts', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('can create a post comment', async ({ client, route }) => {
    const user = await UserFactory.with('profile').create()
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile')).create()
    const pageUrl = route('lessons.show', { slug: post.slug })

    const response = await client
      .post(route('comments.store'))
      .header('referer', pageUrl)
      .withCsrfToken()
      .sessionLoginAs(user)
      .form({
        postId: post.id,
        levelIndex: 0,
        body: 'This is a comment',
      })
      .redirects(0)

    const latestComment = await Comment.query().orderBy('createdAt', 'desc').firstOrFail()

    response.assertFound()
    response.assertToast('success', 'Thanks for your comment!')
    response.assertHeader('location', pageUrl + `#comment${latestComment.id}`)
  })

  test('can reply a post comment', async ({ client, route, assert }) => {
    const user = await UserFactory.with('profile').create()
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile'))
      .with('comments', 1, (comments) =>
        comments.with('user', 1, (commenter) => commenter.with('profile'))
      )
      .create()
    const pageUrl = route('lessons.show', { slug: post.slug })
    const comment = post.comments.at(0)!

    const response = await client
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
      .redirects(0)

    const latestComment = await Comment.query().orderBy('createdAt', 'desc').firstOrFail()

    assert.equal(latestComment.replyTo, comment.id)

    response.assertFound()
    response.assertToast('success', 'Thanks for your comment!')
    response.assertHeader('location', pageUrl + `#comment${latestComment.id}`)
  })

  test('can update a post comment', async ({ client, route, assert }) => {
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile'))
      .with('comments', 1, (comments) =>
        comments.with('user', 1, (commenter) => commenter.with('profile'))
      )
      .create()
    const comment = post.comments.at(0)!
    const user = comment.user!
    const pageUrl = route('lessons.show', { slug: post.slug })

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

  test('can delete a post comment', async ({ client, route, assert }) => {
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile'))
      .with('comments', 1, (comments) =>
        comments.with('user', 1, (commenter) => commenter.with('profile'))
      )
      .create()
    const comment = post.comments.at(0)!
    const user = comment.user!
    const pageUrl = route('lessons.show', { slug: post.slug })

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

  test('author should receive notification and email when a user comments on their post', async ({
    client,
    route,
    assert,
  }) => {
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile')).create()
    const user = await UserFactory.with('profile').create()
    const author = post.authors.at(0)!
    const pageUrl = route('lessons.show', { slug: post.slug })
    const events = emitter.fake()

    await author.load('profile')
    await client
      .post(route('comments.store'))
      .header('referer', pageUrl)
      .withCsrfToken()
      .sessionLoginAs(user)
      .form({
        postId: post.id,
        levelIndex: 0,
        body: 'This is a comment',
      })

    const comment = await Comment.query().orderBy('createdAt', 'desc').firstOrFail()
    const notification = await Notification.query().orderBy('createdAt', 'desc').firstOrFail()

    events.assertEmitted('notification:send')

    assert.isTrue(author.profile.emailOnComment)
    assert.equal(notification.initiatorUserId, user.id)
    assert.equal(notification.userId, author.id)
    assert.equal(notification.table, Comment.table)
    assert.equal(notification.tableId, comment.id)
  })

  test('author should receive notification and not email when a user comments on their post and setting turn off', async ({
    client,
    route,
    assert,
  }) => {
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile')).create()
    const user = await UserFactory.with('profile').create()
    const author = post.authors.at(0)!
    const pageUrl = route('lessons.show', { slug: post.slug })
    const events = emitter.fake()

    await author.load('profile')
    await author.profile.merge({ emailOnComment: false }).save()

    await client
      .post(route('comments.store'))
      .header('referer', pageUrl)
      .withCsrfToken()
      .sessionLoginAs(user)
      .form({
        postId: post.id,
        levelIndex: 0,
        body: 'This is a comment',
      })

    const comment = await Comment.query().orderBy('createdAt', 'desc').firstOrFail()
    const notification = await Notification.query().orderBy('createdAt', 'desc').firstOrFail()

    events.assertNotEmitted('notification:send')

    assert.isFalse(author.profile.emailOnComment)
    assert.equal(notification.initiatorUserId, user.id)
    assert.equal(notification.userId, author.id)
    assert.equal(notification.table, Comment.table)
    assert.equal(notification.tableId, comment.id)
  })
})
