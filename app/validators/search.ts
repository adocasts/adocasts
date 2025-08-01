import Difficulties from '#enums/difficulties'
import Sorts from '#enums/sorts'
import vine from '@vinejs/vine'

export const searchValidator = vine.compile(
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
    difficulties: vine.array(vine.number().enum(Difficulties)).optional(),
    sort: vine.enum(Sorts).optional(),
    topics: vine.array(vine.string()).optional(),
  })
)
