import Themes from '#enums/themes'
import vine from '@vinejs/vine'

export const themeValidator = vine.compile(
  vine.object({
    theme: vine.enum(Object.values(Themes)),
  })
)
