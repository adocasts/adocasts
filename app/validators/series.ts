import Difficulties from '#enums/difficulties'
import Sorts from '#enums/sorts'
import vine from '@vinejs/vine'

export const seriesIndexValidator = vine.create({
  sort: vine.enum(Sorts).optional(),
  difficulties: vine.array(vine.number().enum(Difficulties)).optional(),
  topics: vine.array(vine.string()).optional(),
})

export const seriesPaginatorValidator = vine.create({
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
