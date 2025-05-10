import NotificationGoEntities, { NotificationGoTargets } from '#enums/notification_gos'
import vine from '@vinejs/vine'

export const notificationGoValidator = vine.compile(
  vine.object({
    params: vine.object({
      entity: vine.enum(NotificationGoEntities),
      entityId: vine.number(),
      target: vine.enum(NotificationGoTargets),
      targetId: vine.number(),
    }),
  })
)
