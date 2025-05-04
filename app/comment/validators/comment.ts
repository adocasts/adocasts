import vine from '@vinejs/vine'

export const commentStoreValidator = vine.compile(
  vine.object({
    postId: vine.number().optional(),
    lessonRequestId: vine.number().optional(),
    discussionId: vine.number().optional(),
    rootParentId: vine.number().optional(),
    replyTo: vine.number().optional(),
    body: vine.string().trim(),
    levelIndex: vine.number().positive(),
  })
)

export const commentUpdateValidator = vine.compile(
  vine.object({
    body: vine.string().trim(),
  })
)
