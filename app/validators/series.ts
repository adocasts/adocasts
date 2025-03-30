import Sorts from '#enums/sorts'
import vine from '@vinejs/vine'

export const seriesIndexValidator = vine.compile(
  vine.object({
    sort: vine.enum(Sorts).optional(),
    topic: vine.string().optional(),
  })
)
