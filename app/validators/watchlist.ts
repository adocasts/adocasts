import vine from '@vinejs/vine'

export const watchlistValidator = vine.create({
  postId: vine.number().optional(),
  collectionId: vine.number().optional(),
  taxonomyId: vine.number().optional(),
  fragment: vine.string().optional(),
  identifier: vine.string().optional(),
  target: vine.string().optional(),
})

export const watchlistCollectionValidator = vine.create({
  params: vine.object({
    slug: vine.string().exists({ table: 'collections', column: 'slug' }),
  }),
})

export const watchlistPostValidator = vine.create({
  params: vine.object({
    slug: vine.string().exists({ table: 'posts', column: 'slug' }),
  }),
})

export const watchlistShowValidator = vine.create({
  page: vine
    .number()
    .parse((v) => v ?? 1)
    .positive()
    .optional(),
  perPage: vine
    .number()
    .parse((v) => v ?? 20)
    .positive()
    .max(50)
    .optional(),
})
