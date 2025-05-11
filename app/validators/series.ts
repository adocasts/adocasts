import Difficulties from '#enums/difficulties'
import Sorts from '#enums/sorts'
import vine from '@vinejs/vine'

export const seriesIndexValidator = vine.compile(
  vine.object({
    sort: vine.enum(Sorts).optional(),
    difficulty: vine.number().enum(Difficulties).optional(),
    topic: vine.string().exists({ table: 'taxonomies', column: 'slug' }).optional(),
  })
)

export const seriesPaginatorValidator = vine.compile(
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
    difficulty: vine.number().enum(Difficulties).optional(),
    sort: vine.enum(Sorts).optional(),
    topic: vine.string().exists({ table: 'taxonomies', column: 'slug' }).optional(),
  })
)
