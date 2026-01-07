import vine from '@vinejs/vine'

export const commentStoreValidator = vine.create({
  postId: vine.number().optional(),
  lessonRequestId: vine.number().optional(),
  discussionId: vine.number().optional(),
  rootParentId: vine.number().optional(),
  replyTo: vine.number().optional(),
  body: vine.string().trim(),
  levelIndex: vine.number().positive(),
})

export const commentUpdateValidator = vine.create({
  body: vine.string().trim(),
})
