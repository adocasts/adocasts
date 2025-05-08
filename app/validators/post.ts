import Sorts from '#enums/sorts'
import vine from '@vinejs/vine'

export const postSearchValidator = vine.compile(
  vine.object({
    page: vine
      .number()
      .parse((v) => v ?? 1)
      .positive()
      .optional(),
    perPage: vine
      .number()
      .parse((v) => v ?? 18)
      .positive()
      .max(50)
      .optional(),
    pattern: vine.string().trim().optional(),
    sort: vine.enum(Sorts).optional(),
    topic: vine.string().exists({ table: 'taxonomies', column: 'slug' }).optional(),
  })
)
