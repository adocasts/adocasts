import HttpStatus from '#enums/http_statuses'
import { PostFactory } from '#factories/post_factory'
import { UserFactory } from '#factories/user_factory'
import Comment from '#models/comment'
import CommentVote from '#models/comment_vote'
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
      .withGuard('web')
      .loginAs(user)
      .form({
        postId: post.id,
        levelIndex: 0,
        body: 'This is a comment',
      })
      .redirects(0)

    const latestComment = await Comment.query().orderBy('createdAt', 'desc').firstOrFail()

    response.assertStatus(HttpStatus.FOUND)
    response.assertFlashMessage('success', 'Thanks for your comment!')
    response.assertHeader('location', pageUrl + `#comment${latestComment.id}`)
  })

  test('can reply a post comment', async ({ client, route }) => {
    const user = await UserFactory.with('profile').create()
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile'))
      .with('comments', 1, (comments) =>
        comments.with('user', 1, (commenter) => commenter.with('profile'))
      )
      .create()
    const pageUrl = route('lessons.show', { slug: post.slug })

    const response = await client
      .post(route('comments.store'))
      .header('referer', pageUrl)
      .withGuard('web')
      .loginAs(user)
      .form({
        replyTo: post.comments.at(0)!.id,
        rootParentId: post.comments.at(0)!.id,
        postId: post.id,
        levelIndex: 0,
        body: 'This is a comment',
      })
      .redirects(0)

    const latestComment = await Comment.query().orderBy('createdAt', 'desc').firstOrFail()

    response.assertStatus(HttpStatus.FOUND)
    response.assertFlashMessage('success', 'Thanks for your comment!')
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
      .withGuard('web')
      .loginAs(user)
      .form({
        body: 'This is an updated comment',
      })
      .redirects(0)

    await comment.refresh()

    response.assertStatus(HttpStatus.FOUND)
    response.assertFlashMessage('success', 'Your comment has been updated')
    response.assertHeader('location', pageUrl + `#comment${comment.id}`)

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
      .withGuard('web')
      .loginAs(user)
      .redirects(0)

    const check = await Comment.find(comment.id)

    response.assertStatus(HttpStatus.FOUND)
    response.assertFlashMessage('success', 'Your comment has been deleted')
    response.assertHeader('location', pageUrl)

    assert.isNull(check)
  })

  test('can like a post comment', async ({ client, route, assert }) => {
    const post = await PostFactory.with('authors', 1, (authors) => authors.with('profile'))
      .with('comments', 1, (comments) =>
        comments.with('user', 1, (commenter) => commenter.with('profile'))
      )
      .create()
    const comment = post.comments.at(0)!
    const user = await UserFactory.with('profile').create()
    const pageUrl = route('lessons.show', { slug: post.slug })

    const response = await client
      .patch(route('comments.like', { id: comment.id }))
      .header('referer', pageUrl)
      .withGuard('web')
      .loginAs(user)

    const like = await comment.related('userVotes').query().count('*', 'count').firstOrFail()

    response.assertStatus(HttpStatus.OK)
    response.assertTextIncludes(`<span class="btn-count">${like.$extras.count}</span>`)

    assert.equal(like.$extras.count, 1)
  })

  test('can unlike a post comment', async ({ client, route, assert }) => {
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
      .patch(route('comments.like', { id: comment.id }))
      .header('referer', pageUrl)
      .withGuard('web')
      .loginAs(user)

    const like = await comment.related('userVotes').query().count('*', 'count').firstOrFail()

    response.assertStatus(HttpStatus.OK)
    response.assertTextIncludes(`<span class="btn-count">${like.$extras.count}</span>`)

    assert.equal(like.$extras.count, 0)
  })

  // TODO: notification tests
})
