import SanitizeService from '#services/sanitize_service'
import vine from '@vinejs/vine'
// import { exists } from './helpers/db.js'

export const discussionSearchValidator = vine.compile(
  vine.object({
    pattern: vine.string().trim().optional(),
    topic: vine.string().optional(),
  })
)

export const discussionCreateValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(4).maxLength(100),
    body: vine
      .string()
      .trim()
      .minLength(4)
      .transform((value) => SanitizeService.sanitize(value)),
    taxonomyId: vine.number().positive().optional(), //.exists(exists('taxonomies', 'id')),
  })
)
