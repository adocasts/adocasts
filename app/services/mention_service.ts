import Comment from '#models/comment'
import User from '#models/user'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import NotificationService from './notification_service.js'
import Discussion from '#models/discussion'
import LessonRequest from '#models/lesson_request'

export default class MentionService {
  static async checkForCommentMention(
    comment: Comment,
    user: User,
    trx: TransactionClientContract | null = null
  ) {
    if (!comment.body.includes('data-type="mention"')) return

    const usernames = this.checkTextForMentions(comment.body)

    if (!usernames.length) return

    await NotificationService.onCommentMention(comment, usernames, user, trx)
  }

  static async checkForDiscussionMention(
    discussion: Discussion,
    user: User,
    trx: TransactionClientContract | null = null
  ) {
    if (!discussion.body || !discussion.body.includes('data-type="mention"')) return

    const usernames = this.checkTextForMentions(discussion.body)

    if (!usernames.length) return

    await NotificationService.onDiscussionMention(discussion, usernames, user, trx)
  }

  static async checkForLessonRequestMention(
    request: LessonRequest,
    user: User,
    trx: TransactionClientContract | null = null
  ) {
    if (!request.body || !request.body.includes('data-type="mention"')) return

    const usernames = this.checkTextForMentions(request.body)

    if (!usernames.length) return

    await NotificationService.onLessonRequestMention(request, usernames, user, trx)
  }

  static checkTextForMentions(text: string) {
    // get usernames from each data-id="id" where username can be alpha-numeric, dash, underscore, or period
    const matches = text.matchAll(/data-id="([a-zA-Z0-9_.-]+)"/g)

    // get usernames from regex matches
    return Array.from(matches).map((match) => match[1])
  }

  static checkTextForNewMentions(oldText: string, newText: string) {
    const oldUsernames = this.checkTextForMentions(oldText)
    const newUsernames = this.checkTextForMentions(newText)

    return newUsernames.filter((username) => !oldUsernames.includes(username))
  }
}
