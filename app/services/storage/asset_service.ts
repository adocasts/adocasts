import AssetOptions from '#enums/asset_options'
import type User from '#models/user'
import { type AllyUserContract, type GithubToken, type GoogleToken } from '@adonisjs/ally/types'
import app from '@adonisjs/core/services/app'
import crossFetch from 'cross-fetch'
import { type AvailableFormatInfo, type FormatEnum } from 'sharp'
import assetStorage from '#services/storage/asset_storage_service'
import logger from '#services/core/logger_service'

export class ImageOptions {
  declare width: number
  declare quality: number
  declare format: keyof FormatEnum | AvailableFormatInfo | 'svg+xml'
  declare blur: number
  declare name: string
  declare tempPath: string
  declare path: string
  declare shouldSkip: boolean
}

export default class AssetService {
  static getParamFilename(params: Array<string> | Record<string, any>): string {
    let filename = ''

    if (Array.isArray(params)) {
      filename = params.join('/')
    } else if (params['*']) {
      filename = params['*'].join('/')
    } else {
      filename = Object.values(params).join('/')
    }

    if (filename.includes('.png%3F') || filename.includes('.jpg%3F')) {
      return filename.split('%3F')[0]
    }

    return filename
  }

  static getFilenameExtension(filename: string, defaultValue: string = 'jpg') {
    const name = filename.split('/').pop()

    if (!name) return defaultValue

    return name.includes('.') ? name.split('.').pop() : defaultValue
  }

  static getImageOptions(queries: Record<string, string>, path: string): ImageOptions {
    const isSVG = path.endsWith('.svg')
    let options = new ImageOptions()

    for (let key in queries) {
      switch (key) {
        case AssetOptions.WIDTH_SHORT:
        case AssetOptions.WIDTH:
          // keep width to increments of 10, max 500
          let width = Number.parseInt(queries[key])
          if (width > 1000) width = 1000
          options.width = Math.ceil(width / 50) * 50
          break
        case AssetOptions.QUALITY_SHORT:
        case AssetOptions.QUALITY:
          // keep quality to increments of 10, max 100
          let quality = Number.parseInt(queries[key])
          if (quality > 100) quality = 100
          options.quality = Math.ceil(quality / 10) * 10
          break
        case AssetOptions.FORMAT_SHORT:
        case AssetOptions.FORMAT:
          const format = (queries[key] || '').toLowerCase().split(' ').at(0)
          if (format && assetStorage.supportedFormats.includes(format)) {
            options.format = format as keyof FormatEnum | AvailableFormatInfo | 'svg+xml'
          }
          break
        case AssetOptions.BLUR:
          // keep blur to increments of 10, max 100
          let blur = Number.parseInt(queries[key] || '0')
          if (blur > 100) blur = 100
          options.blur = Math.ceil(blur / 10) * 10
          break
      }
    }

    if (!options.width && !options.quality && !options.format) {
      options.shouldSkip = true
    }

    if (!options.format) {
      const format = path.split('.').at(1)
      options.format = isSVG ? 'svg' : (format as keyof FormatEnum)
    }

    options.name = `width_${options.width}__quality_${options.quality}.${options.format}`
    options.shouldSkip = options.shouldSkip || path.endsWith('.svg') || path.endsWith('.gid')
    options.path = path
    options.tempPath = `.cache/${path}/${options.name}`

    return options
  }

  static async refreshAvatar(user: User, socialUser: AllyUserContract<GithubToken | GoogleToken>) {
    try {
      if (!socialUser.avatarUrl || user.avatarUrl?.startsWith(`${user.id}/profile/`)) return

      const response = await crossFetch(socialUser.avatarUrl)
      const arrayBuffer = await response.arrayBuffer()
      const buffer = new Buffer(arrayBuffer)
      const filename = this.getAvatarFilename(user, socialUser.avatarUrl)

      if (user.avatarUrl === filename) return

      if (app.inProduction && (await assetStorage.exists(filename))) {
        await assetStorage.destroy(filename)
      }

      await assetStorage.store(filename, buffer)

      user.avatarUrl = filename

      await user.save()
    } catch (error) {
      await logger.error('AssetService.refreshAvatar', error)
    }
  }

  static getAvatarFilename(user: User, url: string) {
    const prefix = app.inProduction ? '' : 'local/'
    const extension = this.getFilenameExtension(url, 'jpg')
    return `${prefix}${user.id}/avatar.${extension}`
  }
}
