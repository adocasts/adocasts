import Themes from '#enums/themes'
import vine from '@vinejs/vine'

export const themeValidator = vine.create({
  theme: vine.enum(Object.values(Themes)),
})
