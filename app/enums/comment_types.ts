enum CommentTypes {
  POST = 1,
  LESSON_REQUEST = 2,
  DISCUSSION = 3,
}

export const CommentTypeIdColumn: Record<CommentTypes, string> = {
  [CommentTypes.POST]: 'postId',
  [CommentTypes.LESSON_REQUEST]: 'lessonRequestId',
  [CommentTypes.DISCUSSION]: 'discussionId',
}

export default CommentTypes
