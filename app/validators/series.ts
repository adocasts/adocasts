import vine from '@vinejs/vine'

export const seriesIndexValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    sort: vine.enum(['latest', 'duration', 'lessons']).optional(),
    topics: vine.array(vine.number()).optional(),
  })
)
