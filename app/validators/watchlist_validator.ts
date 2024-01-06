import vine from '@vinejs/vine'

export const watchlistValidator = vine.compile(
  vine.object({
    postId: vine.number().optional(),
    collectionId: vine.number().optional(),
    taxonomyId: vine.number().optional(),
    fragment: vine.string().optional(),
  })
)

