import User from '#models/user'
import sharp, { AvailableFormatInfo, FormatEnum } from 'sharp'
import Asset from '#models/asset'
import app from '@adonisjs/core/services/app'
import { AllyUserContract, GithubToken, GoogleToken } from '@adonisjs/ally/types'
import storage from './storage_service.js'
import crossFetch from 'cross-fetch'

export class ImageOptions {
  declare width: number
  declare quality: number
  declare format: keyof FormatEnum | AvailableFormatInfo | 'svg+xml'
  declare name: string
  declare blur: number
}

export default class AssetService {
  static getAssetUrl(filename: string) {
    return `/img/${filename}`
  }

  static getParamFilename(params: Array<string> | Record<string, any>): string {
    if (Array.isArray(params)) {
      return params.join('/')
    }

    if (params['*']) {
      return params['*'].join('/')
    }

    return Object.values(params).join('/')
  }

  static getFileExtension(file: any): string {
    const contentType = file.headers['content-type']
    const subtype = contentType.slice(contentType.lastIndexOf('/') + 1)
    let extension = subtype.split('+')[0]
    return extension
  }

  static getFilenameExtension(filename: string, defaultValue: string = 'jpg') {
    const name = filename.split('/').pop()

    if (!name) return defaultValue

    return name.includes('.') ? name.split('.').pop() : defaultValue
  }

  static getAlteredImage(file: Buffer | string, options: ImageOptions) {
    if (options.format === 'svg+xml') return
    let image = sharp(file)
    return image.metadata().then((metadata) => {
      const toOptions = options.quality ? { quality: options.quality } : {}

      image
        .resize(options.width || metadata.width)
        .toFormat(options.format as keyof FormatEnum | AvailableFormatInfo, toOptions)

      if (options.blur) {
        image = image.blur(options.blur)
      }

      return image.toBuffer()
    })
  }

  static getImageOptions(queries: Record<string, string>, path: string): ImageOptions {
    const isSVG = path.endsWith('.svg')
    let options = new ImageOptions()

    for (let key in queries) {
      switch (key) {
        case 'w':
        case 'width':
          // keep width to increments of 10, max 500
          let width = Number.parseInt(queries[key])
          if (width > 500) width = 500
          options.width = Math.ceil(width / 50) * 50
          break
        case 'q':
        case 'quality':
          // keep quality to increments of 10, max 100
          let quality = Number.parseInt(queries[key])
          if (quality > 100) quality = 100
          options.quality = Math.ceil(quality / 10) * 10
          break
        case 'f':
        case 'format':
          options.format = queries[key] as keyof FormatEnum | AvailableFormatInfo | 'svg+xml'
          break
        case 'blur':
          // keep blur to increments of 10, max 100
          let blur = Number.parseInt(queries[key] || '0')
          if (blur > 100) blur = 100
          options.blur = Math.ceil(blur / 10) * 10
          break
      }
    }

    if (!options.format) {
      const format = path.split('.').at(1)
      options.format = isSVG ? 'svg' : (format as keyof FormatEnum)
    }

    options.name = `width_${options.width}__quality_${options.quality}.${options.format}`

    return options
  }

  static async refreshAvatar(user: User, socialUser: AllyUserContract<GithubToken | GoogleToken>) {
    if (!socialUser.avatarUrl || user.avatarUrl?.startsWith(`${user.id}/profile/`)) return

    const response = await crossFetch(socialUser.avatarUrl)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = new Buffer(arrayBuffer)
    const filename = this.getAvatarFilename(user, socialUser.avatarUrl)

    if (user.avatarUrl === filename) return

    if (app.inProduction && (await storage.exists(filename))) {
      await storage.destroy(filename)
    }

    await storage.store(filename, buffer)

    user.avatarUrl = filename

    await user.save()
  }

  static getAvatarFilename(user: User, url: string) {
    const prefix = app.inProduction ? '' : 'local/'
    const extension = this.getFilenameExtension(url, 'jpg')
    return `${prefix}${user.id}/avatar.${extension}`
  }

  static async syncAssetTypes(
    assetIds: number[] | undefined,
    assetTypeIds: number[] | undefined,
    altTexts: (string | undefined)[] | undefined,
    credits: (string | undefined)[] | undefined
  ) {
    if (!assetIds || !assetTypeIds) return

    const promises = assetIds.map((id, i) => {
      const assetTypeId = assetTypeIds[i]
      const altText = altTexts && altTexts[i]
      const credit = credits && credits[i]
      return Asset.query().where({ id }).update({ assetTypeId, altText, credit })
    })

    await Promise.all(promises)
  }
}

