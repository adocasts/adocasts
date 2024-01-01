import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

export const advertisementStoreValidator = vine.compile(
  vine.object({
    sizeId: vine.number().positive(),
    asset: vine.file({
      size: '1mb',
      extnames: ['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif'],
    }),
    assetId: vine.number().positive().optional(),
    url: vine.string().trim().url().normalizeUrl().maxLength(250),
    altText: vine.string().trim().maxLength(50).optional(),
    credit: vine.string().trim().maxLength(50).optional(),
    startAt: vine.date().afterOrEqual('today').optional().transform(value => DateTime.fromJSDate(value)),
    endAt: vine.date().afterField('startAt').beforeOrEqual(() => DateTime.now().plus({ months: 6 }).toFormat('yyyy-MM-dd')).optional().transform(date => DateTime.fromJSDate(date)),
  })
)

export const advertisementUpdateValidator = vine.compile(
  vine.object({
    sizeId: vine.number().positive(),
    asset: vine.file({
      size: '1mb',
      extnames: ['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif'],
    }).optional(),
    assetId: vine.number().positive().optional(),
    url: vine.string().trim().url().normalizeUrl().maxLength(250),
    altText: vine.string().trim().maxLength(50).optional(),
    credit: vine.string().trim().maxLength(50).optional(),
    startAt: vine.date().optional().transform(value => DateTime.fromJSDate(value)),
    endAt: vine.date().afterField('startAt').beforeOrEqual(() => DateTime.now().plus({ months: 6 }).toFormat('yyyy-MM-dd')).optional().transform(date => DateTime.fromJSDate(date)),
  })
)