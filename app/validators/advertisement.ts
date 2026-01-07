import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

export const advertisementStoreValidator = vine.create({
  sizeId: vine.number().positive(),
  asset: vine.file({
    size: '1mb',
    extnames: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  }),
  assetId: vine.number().positive().optional(),
  url: vine.string().trim().url().normalizeUrl().maxLength(250),
  altText: vine.string().trim().maxLength(50).optional(),
  credit: vine.string().trim().maxLength(50).optional(),
  startAt: vine
    .date()
    .afterOrEqual('today')
    .optional()
    .transform((value) => DateTime.fromJSDate(value).startOf('day')),
  endAt: vine
    .date()
    .afterField('startAt')
    .beforeOrEqual(() => DateTime.now().plus({ months: 6 }).toFormat('yyyy-MM-dd'))
    .optional()
    .transform((date) => DateTime.fromJSDate(date).endOf('day')),
})

export const advertisementUpdateValidator = vine.create({
  sizeId: vine.number().positive(),
  asset: vine
    .file({
      size: '1mb',
      extnames: ['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif'],
    })
    .optional(),
  assetId: vine.number().positive().optional(),
  url: vine.string().trim().url().normalizeUrl().maxLength(250),
  altText: vine.string().trim().maxLength(50).optional(),
  credit: vine.string().trim().maxLength(50).optional(),
  startAt: vine
    .date()
    .optional()
    .transform((value) => DateTime.fromJSDate(value).startOf('day')),
  endAt: vine
    .date()
    .afterField('startAt')
    .beforeOrEqual(() => DateTime.now().plus({ months: 6 }).toFormat('yyyy-MM-dd'))
    .optional()
    .transform((date) => DateTime.fromJSDate(date).endOf('day')),
})
