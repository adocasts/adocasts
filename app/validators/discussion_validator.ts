import vine from '@vinejs/vine'
// import { exists } from './helpers/db.js'

export const discussionCreateValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(4).maxLength(100),
    body: vine.string().trim().minLength(4).maxLength(65535),
    taxonomyId: vine.number().positive().optional(),//.exists(exists('taxonomies', 'id')),
  })
)