import string from '@adonisjs/core/helpers/string'
import NotificationService from '#services/notification_service';
import router from '@adonisjs/core/services/router';
import { DateTime } from "luxon";
import Comment from "#models/comment";
import History from "#models/history";
import UtilityService from "#services/utility_service";
import LessonRequest from "#models/lesson_request";
import User from "#models/user";
import Post from "#models/post";
import PostTypes, { PostTypeDesc } from "#enums/post_types";
import RequestVote from "#models/request_vote";
import CommentVote from "#models/comment_vote";

class Types {
  public static COMMENT = 'comment'
  public static REPLY = 'reply'
  public static LESSON_REQUEST = 'lessonRequest'
  public static LESSON_COMPLETED = 'lessonCompleted'
  public static ACCOUNT_CREATED = 'accountCreated'
  public static POST = 'post'
  public static ANNIVERSARY = 'anniversary'
  public static VOTE = 'vote'

  public static icon(type: Types) {
    switch (type) {
      case this.COMMENT:
        return 'ph:chat-circle-text-fill'
      case this.REPLY:
        return 'ph:chat-teardrop-text-fill'
      case this.LESSON_REQUEST:
        return 'ph:seal-question-fill'
      case this.LESSON_COMPLETED:
        return 'ph:check-circle-fill'
      case this.ACCOUNT_CREATED:
        return 'ph:confetti-fill'
      case this.POST:
        return 'ph:graduation-cap-fill'
      case this.ANNIVERSARY:
        return 'ph:cake-fill'
      case this.VOTE:
        return 'ph:heart-fill'
      default:
        return 'ph:barricade-fill'
    }
  }
}

interface ActivityModel {
  post?: Post
  comment?: Comment
  commentVote?: CommentVote
  history?: History
  lessonRequest?: LessonRequest
  requestVote?: RequestVote
  user?: User
}

export default class ActivityVM {
  public titleLength = 60

  declare type: Types
  declare titleDescriptor: string
  declare title: string
  declare href: string
  declare body: string
  declare icon: string
  declare createdAt: DateTime
  public color: string = 'bg-slate-200 text-slate-600'

  constructor(public activity?: ActivityModel) {
    if (activity?.post) {
      this.buildForPost(activity.post)
    } else if (activity?.comment) {
      this.buildForComment(activity.comment)
    } else if (activity?.commentVote) {
      this.buildForVoteCommentVote(activity.commentVote)
    } else if (activity?.history) {
      this.buildForHistory(activity.history)
    } else if (activity?.lessonRequest) {
      this.buildForLessonRequest(activity.lessonRequest)
    } else if (activity?.requestVote) {
      this.buildForRequestVote(activity.requestVote)
    }
  }

  public get createdAtDisplay() {
    if (this.createdAt.year !== DateTime.now().year) {
      return this.createdAt.toFormat('MMM dd, yyyy')
    }

    return this.createdAt.toFormat('MMM dd')
  }

  private buildForPost(post: Post) {
    //@ts-ignore
    const postTypeDesc = PostTypeDesc[post.postTypeId]
    let icon = 'ph:newspaper-fill'
    let desc = `Published ${postTypeDesc.toLowerCase()}`

    switch (post.postTypeId) {
      case PostTypes.LESSON:
        icon = 'ph:graduation-cap-fill'
        break
      case PostTypes.SNIPPET:
        icon = 'ph:code-fill'
        break
      case PostTypes.LIVESTREAM:
        icon = 'ph:broadcast-fill'
        desc = 'Livestreamed'
        break
      case PostTypes.LINK:
        icon = 'ph:link-fill'
        desc = 'Shared a link'
        break
    }

    this.type = Types.POST
    this.titleDescriptor = desc
    this.title = post.title
    this.createdAt = post.publishAt!
    this.icon = icon
    this.color = 'bg-accent-400 text-accent-900'
  }

  private buildForComment(comment: Comment) {
    this.type = Types.COMMENT
    this.titleDescriptor = comment.lessonRequest ? 'Commented on request' : 'Commented on post'
    this.body = comment.body
    this.createdAt = comment.createdAt
    this.icon = Types.icon(this.type)

    if (comment.replyTo) {
      this.type = Types.REPLY
      this.titleDescriptor = 'Replied to'
      this.title = string.excerpt(UtilityService.stripHTML(comment.parent.body), this.titleLength, { completeWords: true })
      this.href = NotificationService.getGoPath(comment)
      this.icon = Types.icon(this.type)
      return
    }

    if (comment.lessonRequest) {
      this.title = comment.lessonRequest.name
      this.href = router.makeUrl('requests.lessons.show', { id: comment.lessonRequestId })
      return
    }
    
    this.title = comment.post.title
    this.href = comment.post.routeUrl
  }

  private buildForHistory(history: History) {
    this.type = Types.LESSON_COMPLETED
    this.titleDescriptor = 'Completed lesson'
    this.title = history.post.title
    this.href = history.post.routeUrl
    this.createdAt = history.createdAt
    this.icon = Types.icon(this.type)
    this.color = 'bg-green-400 text-green-900'
  }

  private buildForLessonRequest(request: LessonRequest) {
    this.type = Types.LESSON_REQUEST
    this.titleDescriptor = 'Requested lesson'
    this.title = request.name
    this.href = router.makeUrl('requests.lessons.show', { id: request.id })
    this.createdAt = request.createdAt
    this.icon = Types.icon(this.type)
  }

  private buildForRequestVote(vote: RequestVote) {
    this.type = Types.VOTE
    this.titleDescriptor = 'Upvoted lesson request'
    this.title = vote.lessonRequest.name
    this.href = router.makeUrl('requests.lessons.show', { id: vote.lessonRequestId })
    this.createdAt = vote.createdAt
    this.icon = Types.icon(this.type)
  }

  private buildForVoteCommentVote(vote: CommentVote) {
    this.type = Types.VOTE
    this.titleDescriptor = 'Upvoted comment'
    this.title = string.excerpt(UtilityService.stripHTML(vote.comment.body), this.titleLength, { completeWords: true })
    this.href = NotificationService.getGoPath(vote.comment)
    this.createdAt = vote.createdAt
    this.icon = Types.icon(this.type)
  }

  public static getForUserCreated(user: User) {
    const activity = new ActivityVM()
    activity.type = Types.ACCOUNT_CREATED
    activity.titleDescriptor = 'Account created'
    activity.title = `Welcome to Adocasts, ${user.handle}!`
    activity.icon = Types.icon(activity.type)
    activity.color = 'bg-teal-400 text-teal-900'
    activity.createdAt = user.createdAt
    return activity
  }

  public static getForUserAnniversary(user: User, years: number) {
    const activity = new ActivityVM()
    let titleDescriptor = 'Anniversary'
    let title = `Thanks for being an Acocasts member for ${years} year${years > 1 ? 's' : ''}`

    if (years % 10 === 0) {
      titleDescriptor = `Anniversary milestone`
      title = `${years} whopping years with Adocasts! That's impressive, and we're honored!`
    } else if (years % 5 === 0) {
      titleDescriptor = `Anniversary milestone`
      title = `Thanks for spending ${years} years with Adocasts!`
    } 

    activity.type = Types.ANNIVERSARY
    activity.titleDescriptor = titleDescriptor
    activity.title = title
    activity.icon = Types.icon(activity.type)
    activity.color = 'bg-indigo-400 text-indigo-900'
    activity.createdAt = user.createdAt.plus({ years })

    return activity
  }
}