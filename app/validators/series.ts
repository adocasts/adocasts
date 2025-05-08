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
