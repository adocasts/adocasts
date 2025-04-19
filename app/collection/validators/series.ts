import Difficulties from '#core/enums/difficulties'
import Sorts from '#core/enums/sorts'
import vine from '@vinejs/vine'

export const seriesIndexValidator = vine.compile(
  vine.object({
    sort: vine.enum(Sorts).optional(),
    difficulty: vine.number().enum(Difficulties).optional(),
    topic: vine.string().exists({ table: 'taxonomies', column: 'slug' }).optional(),
  })
)
