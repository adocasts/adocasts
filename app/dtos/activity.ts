import PostTypes, { PostTypeDesc } from '#enums/post_types'
import Comment from '#models/comment'
import CommentVote from '#models/comment_vote'
import Discussion from '#models/discussion'
import DiscussionVote from '#models/discussion_vote'
import LessonRequest from '#models/lesson_request'
import Post from '#models/post'
import Progress from '#models/progress'
import RequestVote from '#models/request_vote'
import User from '#models/user'
import { BaseDto } from '@adocasts.com/dto/base'
import string from '@adonisjs/core/helpers/string'
import router from '@adonisjs/core/services/router'
import { DateTime } from 'luxon'

class Types {
  static COMMENT = 'comment'
  static REPLY = 'reply'
  static LESSON_REQUEST = 'lessonRequest'
  static LESSON_COMPLETED = 'lessonCompleted'
  static ACCOUNT_CREATED = 'accountCreated'
  static POST = 'post'
  static ANNIVERSARY = 'anniversary'
  static VOTE = 'vote'
  static DISCUSSION = 'discussion'

  static icon(type: Types) {
    switch (type) {
      case this.COMMENT:
        return 'solar:chat-square-call-bold-duotone'
      case this.REPLY:
        return 'solar:chat-square-arrow-bold-duotone'
      case this.LESSON_REQUEST:
        return 'solar:clipboard-text-bold-duotone'
      case this.LESSON_COMPLETED:
        return 'solar:check-read-line-duotone'
      case this.ACCOUNT_CREATED:
        return 'solar:confetti-bold-duotone'
      case this.POST:
        return 'solar:book-2-bold-duotone'
      case this.ANNIVERSARY:
        return 'solar:balloon-bold-duotone'
      case this.VOTE:
        return 'solar:heart-angle-bold'
      case this.DISCUSSION:
        return 'solar:chat-round-call-bold-duotone'
      default:
        return 'solar:atom-bold-duotone'
    }
  }
}

interface ActivityModel {
  post?: Post
  comment?: Comment
  commentVote?: CommentVote
  history?: Progress
  lessonRequest?: LessonRequest
  requestVote?: RequestVote
  discussion?: Discussion
  discussionVote?: DiscussionVote
  user?: User
}

export default class ActivityDto extends BaseDto {
  titleLength = 60

  declare type: Types
  declare titleDescriptor: string
  declare title: string
  declare href: string
  declare body: string
  declare icon: string
  declare createdAt: DateTime
  color: string = 'bg-base-100 text-base-content'

  constructor(public activity?: ActivityModel) {
    super()

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
    } else if (activity?.discussion) {
      this.buildForDiscussion(activity.discussion)
    } else if (activity?.discussionVote) {
      this.buildForDiscussionVote(activity.discussionVote)
    }
  }

  get createdAtDisplay() {
    if (this.createdAt.year !== DateTime.now().year) {
      return this.createdAt.toFormat('MMM dd, yyyy')
    }

    return this.createdAt.toFormat('MMM dd')
  }

  private buildForPost(post: Post) {
    //@ts-ignore
    const postTypeDesc = PostTypeDesc[post.postTypeId]
    let icon = 'solar:station-line-duotone'
    let desc = `Published ${postTypeDesc.toLowerCase()}`

    switch (post.postTypeId) {
      case PostTypes.LESSON:
        icon = 'solar:square-academic-cap-2-bold-duotone'
        break
      case PostTypes.SNIPPET:
        icon = 'solar:code-file-bold-duotone'
        break
      case PostTypes.LIVESTREAM:
        icon = 'solar:play-stream-bold-duotone'
        desc = 'Livestreamed'
        break
      case PostTypes.LINK:
        icon = 'solar:link-minimalistic-2-line-duotone'
        desc = 'Shared a link'
        break
    }

    this.type = Types.POST
    this.titleDescriptor = desc
    this.title = post.title
    this.createdAt = post.publishAt!
    this.icon = icon
    this.color = 'bg-accent text-accent-content'
  }

  private buildForComment(comment: Comment) {
    this.type = Types.COMMENT
    this.titleDescriptor = comment.lessonRequest
      ? 'Commented on request'
      : comment.discussion
        ? 'Replied to discussion'
        : 'Commented on post'
    this.body = comment.body
    this.createdAt = comment.createdAt
    this.icon = Types.icon(this.type)

    if (comment.replyTo) {
      this.type = Types.REPLY
      this.titleDescriptor = 'Replied to'
      this.title = string.excerpt(comment.parent.body, this.titleLength, {
        completeWords: true,
      })
      this.href = comment.goPath
      this.icon = Types.icon(this.type)
      return
    }

    if (comment.lessonRequest) {
      this.title = comment.lessonRequest.name
      // this.href = router.makeUrl('requests.lessons.show', { id: comment.lessonRequestId })
      return
    } else if (comment.discussion) {
      this.title = comment.discussion.title
      this.href = router.makeUrl('discussions.show', { slug: comment.discussion.slug })
      return
    }

    this.title = comment.post?.title
    this.href = comment.post?.routeUrl
  }

  private buildForHistory(history: Progress) {
    this.type = Types.LESSON_COMPLETED
    this.titleDescriptor = 'Completed lesson'
    this.title = history.post.title
    this.href = history.post.routeUrl
    this.createdAt = history.createdAt
    this.icon = Types.icon(this.type)
    this.color = 'bg-success text-success-content'
  }

  private buildForLessonRequest(request: LessonRequest) {
    this.type = Types.LESSON_REQUEST
    this.titleDescriptor = 'Requested lesson'
    this.title = request.name
    // this.href = router.makeUrl('requests.lessons.show', { id: request.id })
    this.createdAt = request.createdAt
    this.icon = Types.icon(this.type)
  }

  private buildForRequestVote(vote: RequestVote) {
    this.type = Types.VOTE
    this.titleDescriptor = 'Upvoted lesson request'
    this.title = vote.lessonRequest.name
    // this.href = router.makeUrl('requests.lessons.show', { id: vote.lessonRequestId })
    this.createdAt = vote.createdAt
    this.icon = Types.icon(this.type)
  }

  private buildForDiscussion(discussion: Discussion) {
    this.type = Types.DISCUSSION
    this.titleDescriptor = 'Started discussion'
    this.title = discussion.title
    this.href = router.makeUrl('discussions.show', { slug: discussion.slug })
    this.createdAt = discussion.createdAt
    this.icon = Types.icon(this.type)
  }

  private buildForDiscussionVote(vote: DiscussionVote) {
    this.type = Types.VOTE
    this.titleDescriptor = 'Upvoted discussion'
    this.title = vote.discussion.title
    this.href = router.makeUrl('discussions.show', { slug: vote.discussion.slug })
    this.createdAt = vote.createdAt
    this.icon = Types.icon(this.type)
  }

  private buildForVoteCommentVote(vote: CommentVote) {
    this.type = Types.VOTE
    this.titleDescriptor = 'Upvoted comment'
    this.title = string.excerpt(vote.comment.body, this.titleLength, {
      completeWords: true,
    })
    this.href = vote.comment.goPath
    this.createdAt = vote.createdAt
    this.icon = Types.icon(this.type)
  }

  static getForUserCreated(user: User) {
    const activity = new ActivityDto()
    activity.type = Types.ACCOUNT_CREATED
    activity.titleDescriptor = 'Account created'
    activity.title = `Welcome to Adocasts, ${user.handle}!`
    activity.icon = Types.icon(activity.type)
    activity.color = 'bg-secondary text-secondary-content'
    activity.createdAt = user.createdAt
    return activity
  }

  static getForUserAnniversary(user: User, years: number) {
    const activity = new ActivityDto()
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
    activity.color = 'bg-primary text-primary-content'
    activity.createdAt = user.createdAt.plus({ years })

    return activity
  }
}
