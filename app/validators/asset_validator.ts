import vine from '@vinejs/vine'

export const assetStoreValidator = vine.compile(
  vine.object({
    file: vine.file({
      size: '3mb',
      extnames: ['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif'],
    }),
  })
)

