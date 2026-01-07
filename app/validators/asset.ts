import vine from '@vinejs/vine'

export const assetStoreValidator = vine.create({
  file: vine.file({
    size: '3mb',
    extnames: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  }),
})
