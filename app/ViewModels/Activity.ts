import Comment from "App/Models/Comment";
import History from "App/Models/History";
import UtilityService from "App/Services/UtilityService";
import { string } from '@ioc:Adonis/Core/Helpers'
import NotificationService from "App/Services/NotificationService";
import Route from '@ioc:Adonis/Core/Route'
import LessonRequest from '../Models/LessonRequest';
import { DateTime } from "luxon";
import User from "App/Models/User";
import Post from "App/Models/Post";
import PostTypes, { PostTypeDesc } from "App/Enums/PostTypes";
import RequestVote from "App/Models/RequestVote";
import CommentVote from "App/Models/CommentVote";

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
  public type: 'comment'|'reply'|'lessonRequest'|'lessonCompleted'|'accountCreated'|'post'|'anniversary'|'vote'
  public titleDescriptor: string
  public title: string
  public href: string
  public body: string
  public icon: string
  public color: string = 'bg-slate-200 text-slate-600'
  public createdAt: DateTime

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
    const postTypeDesc = PostTypeDesc[post.postTypeId]
    let icon = 'news'
    let desc = `Published ${postTypeDesc.toLowerCase()}`

    switch (post.postTypeId) {
      case PostTypes.LESSON:
        icon = 'school'
        break
      case PostTypes.SNIPPET:
        icon = 'code'
        break
      case PostTypes.LIVESTREAM:
        icon = 'broadcast'
        desc = 'Livestreamed'
        break
      case PostTypes.LINK:
        icon = 'link'
        desc = 'Shared a link'
        break
    }

    this.type = 'post'
    this.titleDescriptor = desc
    this.title = post.title
    this.createdAt = post.publishAt!
    this.icon = icon
    this.color = 'bg-accent-400 text-accent-900'
  }

  private buildForComment(comment: Comment) {
    this.type = 'comment'
    this.titleDescriptor = comment.lessonRequest ? 'Commented on request' : 'Commented on post'
    this.body = comment.body
    this.createdAt = comment.createdAt
    this.icon = 'message'

    if (comment.replyTo) {
      this.type = 'reply'
      this.titleDescriptor = 'Replied to'
      this.title = string.excerpt(UtilityService.stripHTML(comment.parent.body), 75, { completeWords: true })
      this.href = NotificationService.getGoPath(comment)
      this.icon = 'messages'
      return
    }

    if (comment.lessonRequest) {
      this.title = comment.lessonRequest.name
      this.href = Route.makeUrl('requests.lessons.show', { id: comment.lessonRequestId })
      return
    }
    
    this.title = comment.post.title
    this.href = comment.post.routeUrl
  }

  private buildForHistory(history: History) {
    this.type = 'lessonCompleted'
    this.titleDescriptor = 'Completed lesson'
    this.title = history.post.title
    this.href = history.post.routeUrl
    this.createdAt = history.createdAt
    this.icon = 'check'
    this.color = 'bg-green-400 text-green-900'
  }

  private buildForLessonRequest(request: LessonRequest) {
    this.type = 'lessonRequest'
    this.titleDescriptor = 'Requested lesson'
    this.title = request.name
    this.href = Route.makeUrl('requests.lessons.show', { id: request.id })
    this.createdAt = request.createdAt
    this.icon = 'heart-handshake'
  }

  private buildForRequestVote(vote: RequestVote) {
    this.type = 'vote'
    this.titleDescriptor = 'Upvoted lesson request'
    this.title = vote.lessonRequest.name
    this.href = Route.makeUrl('requests.lessons.show', { id: vote.lessonRequestId })
    this.createdAt = vote.createdAt
    this.icon = 'heart'
  }

  private buildForVoteCommentVote(vote: CommentVote) {
    this.type = 'vote'
    this.titleDescriptor = 'Upvoted comment'
    this.title = string.excerpt(UtilityService.stripHTML(vote.comment.body), 75, { completeWords: true })
    this.href = NotificationService.getGoPath(vote.comment)
    this.createdAt = vote.createdAt
    this.icon = 'heart'
  }

  public static getForUserCreated(user: User) {
    const activity = new ActivityVM()
    activity.type = 'accountCreated'
    activity.titleDescriptor = 'Account created'
    activity.title = `Welcome to Adocasts, ${user.handle}!`
    activity.icon = 'confetti'
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

    activity.type = 'anniversary'
    activity.titleDescriptor = titleDescriptor
    activity.title = title
    activity.icon = 'cake'
    activity.color = 'bg-indigo-400 text-indigo-900'
    activity.createdAt = user.createdAt.plus({ years })

    return activity
  }
}