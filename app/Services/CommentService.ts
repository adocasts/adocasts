import Post from "App/Models/Post";
import States from 'App/Enums/States'
import HttpIdentityService from "./Http/HttpIdentityService";
import { rules, schema, validator } from '@ioc:Adonis/Core/Validator'
import Comment from 'App/Models/Comment'
import IdentityService from 'App/Services/IdentityService'
import NotificationService from 'App/Services/NotificationService'
import sanitizeHtml from 'sanitize-html'
import Logger from '@ioc:Logger/Discord'
import User from 'App/Models/User'

export default class CommentService {
  public static async getForPost(post: Post) {
    const httpIdentityService = new HttpIdentityService()
    const identity = await httpIdentityService.getRequestIdentity()

    return post.related('comments')
      .query()
      .preload('user')
      .preload('userVotes', query => query.select(['id']))
      .where(query => query
          .where('stateId', States.PUBLIC)
          .orWhere({ identity })
      )
      .orderBy('createdAt', 'desc')
      .highlightAll()
  }

  public static async store(user: User | undefined, identity: string, requestBody: { [x: string]: any }) {
    const _schema = schema.create({
      postId: schema.number([rules.exists({ table: 'posts', column: 'id' }) ]),
      rootParentId: schema.number.optional([rules.exists({ table: 'comments', column: 'id' }) ]),
      replyTo: schema.number.optional([rules.exists({ table: 'comments', column: 'id' })]),
      body: schema.string({ trim: true }),
      levelIndex: schema.number([rules.unsigned()])
    });

    const { body, ...data } = await validator.validate({ schema: _schema, data: requestBody })

    const comment = await Comment.create({
      ...data,
      identity,
      body: sanitizeHtml(body),
      name: user?.id ? undefined : await IdentityService.getByIdentity(Comment.table, identity),
      userId: user?.id,
      stateId: user?.id ? States.PUBLIC : States.IN_REVIEW,
    })

    if (!comment.rootParentId) {
      comment.rootParentId = comment.id
      await comment.save()
    }

    comment.replyTo
      ? await NotificationService.onCommentReply(comment, user)
      : await NotificationService.onComment(comment, user)

    await Logger.info('NEW COMMENT', {
      postId: comment.postId,
      body: comment.body,
      go: NotificationService.getGoPath(comment)
    })

    return comment
  }
}
