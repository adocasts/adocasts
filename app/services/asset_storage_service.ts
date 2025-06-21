import { MultipartFile } from '@adonisjs/core/bodyparser'
import app from '@adonisjs/core/services/app'
import drive from '@adonisjs/drive/services/main'
import fs from 'node:fs'
import sharp, { AvailableFormatInfo, FormatEnum } from 'sharp'
import { ImageOptions } from './asset_service.js'
import logger from './logger_service.js'

class AssetStorageService {
  async exists(filename: string) {
    return drive.use().exists(filename)
  }

  get(filename: string) {
    return drive.use().getStream(filename)
  }

  async store(filename: string, data: Buffer) {
    if (app.inTest) return
    await drive.use().put(filename, data)
  }

  async storeFromTmp(location: string, filename: string, file: MultipartFile) {
    await file.moveToDisk(filename)
    return new Promise<void>((resolve, reject) => {
      try {
        fs.readFile(file.tmpPath!, async (error, data) => {
          if (error) {
            reject(error)
          }

          await drive.use().put(location + filename, data)

          file.markAsMoved('/img/' + filename, location)

          resolve()
        })
      } catch (error) {
        console.log({ error })
        logger.error('StorageService.storeFromTmp', error)
      }
    })
  }

  async destroy(filename: string) {
    if (app.inTest) return
    await drive.use().delete(filename)
  }

  async alter(options: ImageOptions) {
    if (app.inTest) return
    if (options.format === 'svg+xml') return

    const file = await drive.use().getBytes(options.path)
    const image = sharp(file)
    const imageAltered = await image.metadata().then((metadata) => {
      const toOptions = options.quality ? { quality: options.quality } : {}
      return image
        .resize(options.width || metadata.width)
        .toFormat(options.format as keyof FormatEnum | AvailableFormatInfo, toOptions)
        .toBuffer()
    })

    return drive.use().put(options.tempPath, imageAltered)
  }
}

const assetStorage = new AssetStorageService()
export default assetStorage
