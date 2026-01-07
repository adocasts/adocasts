import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export class AdvertisementEventSchema extends BaseModel {
  static $columns = ['id', 'typeId', 'advertisementId', 'identity', 'category', 'action', 'path', 'host', 'browser', 'browserVersion', 'os', 'createdAt', 'updatedAt'] as const
  $columns = AdvertisementEventSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare typeId: number
  @column()
  declare advertisementId: number
  @column()
  declare identity: string
  @column()
  declare category: string
  @column()
  declare action: string
  @column()
  declare path: string
  @column()
  declare host: string
  @column()
  declare browser: string
  @column()
  declare browserVersion: string
  @column()
  declare os: string
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class AdvertisementSizeSchema extends BaseModel {
  static $columns = ['id', 'name', 'width', 'height', 'createdAt', 'updatedAt'] as const
  $columns = AdvertisementSizeSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare name: string
  @column()
  declare width: number
  @column()
  declare height: number
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class AdvertisementSchema extends BaseModel {
  static $columns = ['id', 'userId', 'assetId', 'sizeId', 'stateId', 'url', 'startAt', 'endAt', 'createdAt', 'updatedAt'] as const
  $columns = AdvertisementSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare userId: number
  @column()
  declare assetId: number
  @column()
  declare sizeId: number
  @column()
  declare stateId: number
  @column()
  declare url: string
  @column.dateTime()
  declare startAt: DateTime
  @column.dateTime()
  declare endAt: DateTime
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class AssetPostSchema extends BaseModel {
  static $columns = ['id', 'postId', 'assetId', 'sortOrder', 'createdAt', 'updatedAt'] as const
  $columns = AssetPostSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare postId: number
  @column()
  declare assetId: number
  @column()
  declare sortOrder: number
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class AssetSchema extends BaseModel {
  static $columns = ['id', 'assetTypeId', 'filename', 'byteSize', 'altText', 'credit', 'createdAt', 'updatedAt'] as const
  $columns = AssetSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare assetTypeId: number
  @column()
  declare filename: string
  @column()
  declare byteSize: number
  @column()
  declare altText: string | null
  @column()
  declare credit: string | null
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class AuthAttemptSchema extends BaseModel {
  static $columns = ['id', 'uid', 'purposeId', 'deletedAt', 'createdAt', 'updatedAt'] as const
  $columns = AuthAttemptSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare uid: string
  @column()
  declare purposeId: number
  @column.dateTime()
  declare deletedAt: DateTime | null
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class AuthorPostSchema extends BaseModel {
  static $columns = ['id', 'postId', 'userId', 'authorTypeId', 'createdAt', 'updatedAt'] as const
  $columns = AuthorPostSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare postId: number
  @column()
  declare userId: number
  @column()
  declare authorTypeId: number | null
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class BlockSchema extends BaseModel {
  static $columns = ['id', 'userId', 'sectionId', 'ipAddress', 'reason', 'expiresAt', 'createdAt', 'updatedAt'] as const
  $columns = BlockSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare userId: number | null
  @column()
  declare sectionId: number
  @column()
  declare ipAddress: string
  @column()
  declare reason: string | null
  @column.dateTime()
  declare expiresAt: DateTime | null
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class CollectionPostSchema extends BaseModel {
  static $columns = ['id', 'postId', 'collectionId', 'sortOrder', 'createdAt', 'updatedAt', 'rootCollectionId', 'rootSortOrder'] as const
  $columns = CollectionPostSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare postId: number | null
  @column()
  declare collectionId: number | null
  @column()
  declare sortOrder: number
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
  @column()
  declare rootCollectionId: number | null
  @column()
  declare rootSortOrder: number | null
}

export class CollectionTaxonomySchema extends BaseModel {
  static $columns = ['id', 'collectionId', 'taxonomyId', 'sortOrder', 'createdAt', 'updatedAt'] as const
  $columns = CollectionTaxonomySchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare collectionId: number | null
  @column()
  declare taxonomyId: number | null
  @column()
  declare sortOrder: number
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class CollectionSchema extends BaseModel {
  static $columns = ['id', 'ownerId', 'parentId', 'collectionTypeId', 'statusId', 'stateId', 'assetId', 'name', 'slug', 'description', 'pageTitle', 'metaDescription', 'sortOrder', 'createdAt', 'updatedAt', 'youtubePlaylistUrl', 'isFeatured', 'repositoryUrl', 'outdatedVersionId', 'difficultyId', 'paywallTypeId', 'repositoryAccessLevel'] as const
  $columns = CollectionSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare ownerId: number | null
  @column()
  declare parentId: number | null
  @column()
  declare collectionTypeId: number
  @column()
  declare statusId: number
  @column()
  declare stateId: number
  @column()
  declare assetId: number | null
  @column()
  declare name: string
  @column()
  declare slug: string
  @column()
  declare description: string
  @column()
  declare pageTitle: string
  @column()
  declare metaDescription: string
  @column()
  declare sortOrder: number
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
  @column()
  declare youtubePlaylistUrl: string | null
  @column()
  declare isFeatured: boolean
  @column()
  declare repositoryUrl: string | null
  @column()
  declare outdatedVersionId: number | null
  @column()
  declare difficultyId: number | null
  @column()
  declare paywallTypeId: number | null
  @column()
  declare repositoryAccessLevel: number
}

export class CommentTypeSchema extends BaseModel {
  static $columns = ['id', 'name', 'createdAt', 'updatedAt'] as const
  $columns = CommentTypeSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare name: string
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class CommentVoteSchema extends BaseModel {
  static $columns = ['id', 'userId', 'commentId', 'createdAt', 'updatedAt'] as const
  $columns = CommentVoteSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare userId: number | null
  @column()
  declare commentId: number | null
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class CommentSchema extends BaseModel {
  static $columns = ['id', 'name', 'postId', 'userId', 'replyTo', 'stateId', 'identity', 'body', 'createdAt', 'updatedAt', 'rootParentId', 'levelIndex', 'lessonRequestId', 'commentTypeId', 'discussionId'] as const
  $columns = CommentSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare name: string | null
  @column()
  declare postId: number | null
  @column()
  declare userId: number | null
  @column()
  declare replyTo: number | null
  @column()
  declare stateId: number
  @column()
  declare identity: string | null
  @column()
  declare body: string | null
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
  @column()
  declare rootParentId: number | null
  @column()
  declare levelIndex: number
  @column()
  declare lessonRequestId: number | null
  @column()
  declare commentTypeId: number
  @column()
  declare discussionId: number | null
}

export class DiscussionViewSchema extends BaseModel {
  static $columns = ['id', 'userId', 'discussionId', 'typeId', 'ipAddress', 'userAgent', 'createdAt', 'updatedAt'] as const
  $columns = DiscussionViewSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare userId: number | null
  @column()
  declare discussionId: number
  @column()
  declare typeId: number
  @column()
  declare ipAddress: string
  @column()
  declare userAgent: string
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class DiscussionVoteSchema extends BaseModel {
  static $columns = ['id', 'userId', 'discussionId', 'createdAt', 'updatedAt'] as const
  $columns = DiscussionVoteSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare userId: number | null
  @column()
  declare discussionId: number | null
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class DiscussionSchema extends BaseModel {
  static $columns = ['id', 'userId', 'taxonomyId', 'stateId', 'title', 'slug', 'body', 'views', 'impressions', 'createdAt', 'updatedAt', 'solvedAt', 'solvedCommentId'] as const
  $columns = DiscussionSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare userId: number
  @column()
  declare taxonomyId: number | null
  @column()
  declare stateId: number
  @column()
  declare title: string
  @column()
  declare slug: string
  @column()
  declare body: string
  @column()
  declare views: number
  @column()
  declare impressions: number
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
  @column.dateTime()
  declare solvedAt: DateTime | null
  @column()
  declare solvedCommentId: number | null
}

export class EmailHistorySchema extends BaseModel {
  static $columns = ['id', 'userId', 'emailFrom', 'emailTo', 'createdAt', 'updatedAt'] as const
  $columns = EmailHistorySchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare userId: number
  @column()
  declare emailFrom: string
  @column()
  declare emailTo: string
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class HistorySchema extends BaseModel {
  static $columns = ['id', 'userId', 'postId', 'collectionId', 'taxonomyId', 'historyTypeId', 'route', 'readPercent', 'watchPercent', 'isCompleted', 'createdAt', 'updatedAt', 'watchSeconds'] as const
  $columns = HistorySchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare userId: number
  @column()
  declare postId: number | null
  @column()
  declare collectionId: number | null
  @column()
  declare taxonomyId: number | null
  @column()
  declare historyTypeId: number
  @column()
  declare route: string
  @column()
  declare readPercent: number | null
  @column()
  declare watchPercent: number | null
  @column()
  declare isCompleted: boolean
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
  @column()
  declare watchSeconds: number
}

export class InvoiceSchema extends BaseModel {
  static $columns = ['id', 'userId', 'invoiceId', 'invoiceNumber', 'chargeId', 'amountDue', 'amountPaid', 'amountRemaining', 'status', 'paid', 'periodStartAt', 'periodEndAt', 'createdAt', 'updatedAt'] as const
  $columns = InvoiceSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare userId: number
  @column()
  declare invoiceId: string
  @column()
  declare invoiceNumber: string
  @column()
  declare chargeId: string | null
  @column()
  declare amountDue: number
  @column()
  declare amountPaid: number
  @column()
  declare amountRemaining: number
  @column()
  declare status: string | null
  @column()
  declare paid: boolean | null
  @column.dateTime()
  declare periodStartAt: DateTime | null
  @column.dateTime()
  declare periodEndAt: DateTime | null
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class LessonRequestSchema extends BaseModel {
  static $columns = ['id', 'userId', 'stateId', 'priority', 'name', 'body', 'createdAt', 'updatedAt', 'approveCommentId', 'rejectCommentId', 'completeCommentId'] as const
  $columns = LessonRequestSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare userId: number
  @column()
  declare stateId: number
  @column()
  declare priority: number
  @column()
  declare name: string
  @column()
  declare body: string | null
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
  @column()
  declare approveCommentId: number | null
  @column()
  declare rejectCommentId: number | null
  @column()
  declare completeCommentId: number | null
}

export class NoteSchema extends BaseModel {
  static $columns = ['id', 'userId', 'postId', 'timestampSeconds', 'body', 'isAuthorNote', 'createdAt', 'updatedAt'] as const
  $columns = NoteSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare userId: number
  @column()
  declare postId: number | null
  @column()
  declare timestampSeconds: number | null
  @column()
  declare body: string
  @column()
  declare isAuthorNote: boolean
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class NotificationSchema extends BaseModel {
  static $columns = ['id', 'global', 'userId', 'initiatorUserId', 'notificationTypeId', 'table', 'tableId', 'title', 'body', 'href', 'readAt', 'actionedAt', 'createdAt', 'updatedAt'] as const
  $columns = NotificationSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare global: boolean
  @column()
  declare userId: number
  @column()
  declare initiatorUserId: number | null
  @column()
  declare notificationTypeId: number
  @column()
  declare table: string | null
  @column()
  declare tableId: number | null
  @column()
  declare title: string
  @column()
  declare body: string
  @column()
  declare href: string | null
  @column.dateTime()
  declare readAt: DateTime | null
  @column.dateTime()
  declare actionedAt: DateTime | null
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class PlanSchema extends BaseModel {
  static $columns = ['id', 'slug', 'name', 'description', 'stripePriceId', 'stripePriceTestId', 'price', 'isActive', 'createdAt', 'updatedAt', 'couponCode', 'couponDiscountFixed', 'couponDiscountPercent', 'couponStartAt', 'couponEndAt', 'couponDurationId', 'stripeCouponId'] as const
  $columns = PlanSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare slug: string
  @column()
  declare name: string
  @column()
  declare description: string | null
  @column()
  declare stripePriceId: string | null
  @column()
  declare stripePriceTestId: string | null
  @column()
  declare price: number
  @column()
  declare isActive: boolean
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
  @column()
  declare couponCode: string | null
  @column()
  declare couponDiscountFixed: number | null
  @column()
  declare couponDiscountPercent: number | null
  @column.dateTime()
  declare couponStartAt: DateTime | null
  @column.dateTime()
  declare couponEndAt: DateTime | null
  @column()
  declare couponDurationId: number | null
  @column()
  declare stripeCouponId: string | null
}

export class PostCaptionSchema extends BaseModel {
  static $columns = ['id', 'postId', 'type', 'label', 'language', 'filename', 'sortOrder', 'createdAt', 'updatedAt'] as const
  $columns = PostCaptionSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare postId: number
  @column()
  declare type: string
  @column()
  declare label: string
  @column()
  declare language: string
  @column()
  declare filename: string
  @column()
  declare sortOrder: number
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class PostChapterSchema extends BaseModel {
  static $columns = ['id', 'postId', 'start', 'end', 'text', 'sortOrder', 'createdAt', 'updatedAt'] as const
  $columns = PostChapterSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare postId: number
  @column()
  declare start: string
  @column()
  declare end: string
  @column()
  declare text: string
  @column()
  declare sortOrder: number
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class PostSnapshotSchema extends BaseModel {
  static $columns = ['id', 'postId', 'revision', 'revisionDate', 'revisedBy', 'title', 'slug', 'pageTitle', 'description', 'metaDescription', 'canonical', 'body', 'videoUrl', 'isFeatured', 'isPersonal', 'viewCount', 'viewCountUnique', 'stateId', 'timezone', 'publishAtUser', 'publishAt', 'deletedAt', 'createdAt', 'updatedAt'] as const
  $columns = PostSnapshotSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare postId: number
  @column()
  declare revision: number
  @column.dateTime()
  declare revisionDate: DateTime
  @column()
  declare revisedBy: number
  @column()
  declare title: string
  @column()
  declare slug: string
  @column()
  declare pageTitle: string | null
  @column()
  declare description: string | null
  @column()
  declare metaDescription: string | null
  @column()
  declare canonical: string | null
  @column()
  declare body: string | null
  @column()
  declare videoUrl: string | null
  @column()
  declare isFeatured: boolean | null
  @column()
  declare isPersonal: boolean | null
  @column()
  declare viewCount: number | null
  @column()
  declare viewCountUnique: number | null
  @column()
  declare stateId: number
  @column()
  declare timezone: string | null
  @column()
  declare publishAtUser: string | null
  @column.dateTime()
  declare publishAt: DateTime | null
  @column.dateTime()
  declare deletedAt: DateTime | null
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class PostTaxonomySchema extends BaseModel {
  static $columns = ['id', 'postId', 'taxonomyId', 'sortOrder', 'createdAt', 'updatedAt'] as const
  $columns = PostTaxonomySchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare postId: number | null
  @column()
  declare taxonomyId: number | null
  @column()
  declare sortOrder: number
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class PostTopicSchema extends BaseModel {
  static $columns = ['id', 'postId', 'topicId', 'sortOrder', 'createdAt', 'updatedAt'] as const
  $columns = PostTopicSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare postId: number
  @column()
  declare topicId: number
  @column()
  declare sortOrder: number
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class PostSchema extends BaseModel {
  static $columns = ['id', 'title', 'slug', 'pageTitle', 'description', 'metaDescription', 'canonical', 'body', 'videoUrl', 'isFeatured', 'isPersonal', 'viewCount', 'viewCountUnique', 'stateId', 'timezone', 'publishAtUser', 'publishAt', 'createdAt', 'updatedAt', 'readMinutes', 'readTime', 'wordCount', 'videoSeconds', 'postTypeId', 'redirectUrl', 'bodyBlocks', 'bodyTypeId', 'repositoryUrl', 'isLive', 'livestreamUrl', 'paywallTypeId', 'videoTypeId', 'videoBunnyId', 'isWatchlistSent', 'updatedContentAt', 'repositoryAccessLevel', 'ragAddedAt'] as const
  $columns = PostSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare title: string
  @column()
  declare slug: string
  @column()
  declare pageTitle: string | null
  @column()
  declare description: string | null
  @column()
  declare metaDescription: string | null
  @column()
  declare canonical: string | null
  @column()
  declare body: string | null
  @column()
  declare videoUrl: string | null
  @column()
  declare isFeatured: boolean | null
  @column()
  declare isPersonal: boolean | null
  @column()
  declare viewCount: number | null
  @column()
  declare viewCountUnique: number | null
  @column()
  declare stateId: number
  @column()
  declare timezone: string | null
  @column()
  declare publishAtUser: string | null
  @column.dateTime()
  declare publishAt: DateTime | null
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
  @column()
  declare readMinutes: number
  @column()
  declare readTime: number
  @column()
  declare wordCount: number
  @column()
  declare videoSeconds: number
  @column()
  declare postTypeId: number
  @column()
  declare redirectUrl: string | null
  @column()
  declare bodyBlocks: any | null
  @column()
  declare bodyTypeId: number
  @column()
  declare repositoryUrl: string | null
  @column()
  declare isLive: boolean
  @column()
  declare livestreamUrl: string | null
  @column()
  declare paywallTypeId: number
  @column()
  declare videoTypeId: number
  @column()
  declare videoBunnyId: string | null
  @column()
  declare isWatchlistSent: boolean | null
  @column.dateTime()
  declare updatedContentAt: DateTime | null
  @column()
  declare repositoryAccessLevel: number
  @column.dateTime()
  declare ragAddedAt: DateTime | null
}

export class ProfileSchema extends BaseModel {
  static $columns = ['id', 'userId', 'avatarAssetId', 'biography', 'location', 'website', 'company', 'twitterUrl', 'facebookUrl', 'instagramUrl', 'linkedinUrl', 'youtubeUrl', 'githubUrl', 'createdAt', 'updatedAt', 'emailOnComment', 'emailOnCommentReply', 'emailOnAchievement', 'name', 'threadsUrl', 'emailOnNewDeviceLogin', 'emailOnWatchlist', 'emailOnMention', 'blueskyUrl'] as const
  $columns = ProfileSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare userId: number
  @column()
  declare avatarAssetId: number | null
  @column()
  declare biography: string | null
  @column()
  declare location: string | null
  @column()
  declare website: string | null
  @column()
  declare company: string | null
  @column()
  declare twitterUrl: string | null
  @column()
  declare facebookUrl: string | null
  @column()
  declare instagramUrl: string | null
  @column()
  declare linkedinUrl: string | null
  @column()
  declare youtubeUrl: string | null
  @column()
  declare githubUrl: string | null
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
  @column()
  declare emailOnComment: boolean | null
  @column()
  declare emailOnCommentReply: boolean | null
  @column()
  declare emailOnAchievement: boolean | null
  @column()
  declare name: string | null
  @column()
  declare threadsUrl: string | null
  @column()
  declare emailOnNewDeviceLogin: boolean
  @column()
  declare emailOnWatchlist: boolean
  @column()
  declare emailOnMention: boolean | null
  @column()
  declare blueskyUrl: string | null
}

export class ProgressSchema extends BaseModel {
  static $columns = ['id', 'userId', 'postId', 'collectionId', 'readPercent', 'watchPercent', 'watchSeconds', 'isCompleted', 'createdAt', 'updatedAt'] as const
  $columns = ProgressSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare userId: number
  @column()
  declare postId: number | null
  @column()
  declare collectionId: number | null
  @column()
  declare readPercent: number | null
  @column()
  declare watchPercent: number | null
  @column()
  declare watchSeconds: number
  @column()
  declare isCompleted: boolean
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class QuestionVoteSchema extends BaseModel {
  static $columns = ['id', 'userId', 'questionId', 'createdAt', 'updatedAt'] as const
  $columns = QuestionVoteSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare userId: number | null
  @column()
  declare questionId: number | null
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class QuestionSchema extends BaseModel {
  static $columns = ['id', 'userId', 'title', 'body', 'createdAt', 'updatedAt'] as const
  $columns = QuestionSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare userId: number | null
  @column()
  declare title: string
  @column()
  declare body: string
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class RateLimitSchema extends BaseModel {
  static $columns = ['key', 'points', 'expire'] as const
  $columns = RateLimitSchema.$columns
  @column()
  declare key: string
  @column()
  declare points: number
  @column()
  declare expire: bigint | number | null
}

export class RememberMeTokenSchema extends BaseModel {
  static $columns = ['id', 'tokenableId', 'hash', 'createdAt', 'updatedAt', 'expiresAt'] as const
  $columns = RememberMeTokenSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare tokenableId: number
  @column()
  declare hash: string
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
  @column.dateTime()
  declare expiresAt: DateTime
}

export class RequestVoteSchema extends BaseModel {
  static $columns = ['id', 'userId', 'lessonRequestId', 'createdAt', 'updatedAt'] as const
  $columns = RequestVoteSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare userId: number | null
  @column()
  declare lessonRequestId: number | null
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class RoleSchema extends BaseModel {
  static $columns = ['id', 'name', 'description', 'createdAt', 'updatedAt'] as const
  $columns = RoleSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare name: string
  @column()
  declare description: string | null
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class SessionLogSchema extends BaseModel {
  static $columns = ['id', 'userId', 'token', 'ipAddress', 'userAgent', 'city', 'country', 'countryCode', 'loginAt', 'loginSuccessful', 'logoutAt', 'forceLogout', 'lastTouchedAt', 'createdAt', 'updatedAt', 'isRememberSession', 'browserName', 'browserEngine', 'browserVersion', 'deviceModel', 'deviceType', 'deviceVendor', 'osName', 'osVersion', 'sessionId'] as const
  $columns = SessionLogSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare userId: number
  @column()
  declare token: string
  @column()
  declare ipAddress: string | null
  @column()
  declare userAgent: string | null
  @column()
  declare city: string | null
  @column()
  declare country: string | null
  @column()
  declare countryCode: string | null
  @column.dateTime()
  declare loginAt: DateTime | null
  @column()
  declare loginSuccessful: boolean
  @column.dateTime()
  declare logoutAt: DateTime | null
  @column()
  declare forceLogout: boolean
  @column.dateTime()
  declare lastTouchedAt: DateTime | null
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
  @column()
  declare isRememberSession: boolean
  @column()
  declare browserName: string | null
  @column()
  declare browserEngine: string | null
  @column()
  declare browserVersion: string | null
  @column()
  declare deviceModel: string | null
  @column()
  declare deviceType: string | null
  @column()
  declare deviceVendor: string | null
  @column()
  declare osName: string | null
  @column()
  declare osVersion: string | null
  @column()
  declare sessionId: string | null
}

export class TaxonomySchema extends BaseModel {
  static $columns = ['id', 'parentId', 'assetId', 'name', 'slug', 'description', 'pageTitle', 'metaDescription', 'createdAt', 'updatedAt', 'rootParentId', 'levelIndex', 'isFeatured', 'ownerId', 'taxonomyTypeId'] as const
  $columns = TaxonomySchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare parentId: number | null
  @column()
  declare assetId: number | null
  @column()
  declare name: string
  @column()
  declare slug: string
  @column()
  declare description: string
  @column()
  declare pageTitle: string
  @column()
  declare metaDescription: string
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
  @column()
  declare rootParentId: number | null
  @column()
  declare levelIndex: number | null
  @column()
  declare isFeatured: boolean
  @column()
  declare ownerId: number
  @column()
  declare taxonomyTypeId: number
}

export class TestimonialSchema extends BaseModel {
  static $columns = ['id', 'userId', 'body', 'approvedAt', 'rejectedAt', 'staleAt', 'createdAt', 'updatedAt'] as const
  $columns = TestimonialSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare userId: number | null
  @column()
  declare body: string
  @column.dateTime()
  declare approvedAt: DateTime | null
  @column.dateTime()
  declare rejectedAt: DateTime | null
  @column.dateTime()
  declare staleAt: DateTime | null
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class TopicSchema extends BaseModel {
  static $columns = ['id', 'userId', 'name', 'slug', 'createdAt', 'updatedAt'] as const
  $columns = TopicSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare userId: number
  @column()
  declare name: string
  @column()
  declare slug: string
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

export class UserSchema extends BaseModel {
  static $columns = ['id', 'roleId', 'username', 'email', 'password', 'rememberMeToken', 'avatarUrl', 'createdAt', 'updatedAt', 'githubId', 'githubEmail', 'googleId', 'googleEmail', 'theme', 'emailVerified', 'emailVerifiedAt', 'planId', 'planPeriodStart', 'planPeriodEnd', 'stripeCustomerId', 'stripeSubscriptionStatus', 'stripeSubscriptionPausedAt', 'stripeSubscriptionCanceledAt', 'isEnabledProfile', 'isEnabledMiniPlayer', 'isEnabledAutoplayNext', 'billToInfo', 'isEnabledMentions', 'defaultLessonPanel', 'githubTeamInviteStatus', 'githubTeamInviteUsername', 'githubTeamInviteUserId'] as const
  $columns = UserSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare roleId: number
  @column()
  declare username: string
  @column()
  declare email: string | null
  @column({ serializeAs: null })
  declare password: string | null
  @column()
  declare rememberMeToken: string | null
  @column()
  declare avatarUrl: string | null
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
  @column()
  declare githubId: string | null
  @column()
  declare githubEmail: string | null
  @column()
  declare googleId: string | null
  @column()
  declare googleEmail: string | null
  @column()
  declare theme: string
  @column()
  declare emailVerified: string | null
  @column.dateTime()
  declare emailVerifiedAt: DateTime | null
  @column()
  declare planId: number
  @column.dateTime()
  declare planPeriodStart: DateTime | null
  @column.dateTime()
  declare planPeriodEnd: DateTime | null
  @column()
  declare stripeCustomerId: string | null
  @column()
  declare stripeSubscriptionStatus: string | null
  @column.dateTime()
  declare stripeSubscriptionPausedAt: DateTime | null
  @column.dateTime()
  declare stripeSubscriptionCanceledAt: DateTime | null
  @column()
  declare isEnabledProfile: boolean
  @column()
  declare isEnabledMiniPlayer: boolean
  @column()
  declare isEnabledAutoplayNext: boolean
  @column()
  declare billToInfo: string | null
  @column()
  declare isEnabledMentions: boolean | null
  @column()
  declare defaultLessonPanel: number
  @column()
  declare githubTeamInviteStatus: string | null
  @column()
  declare githubTeamInviteUsername: string | null
  @column()
  declare githubTeamInviteUserId: string | null
}

export class WatchlistSchema extends BaseModel {
  static $columns = ['id', 'userId', 'postId', 'collectionId', 'taxonomyId', 'createdAt', 'updatedAt'] as const
  $columns = WatchlistSchema.$columns
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare userId: number
  @column()
  declare postId: number | null
  @column()
  declare collectionId: number | null
  @column()
  declare taxonomyId: number | null
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime | null
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
