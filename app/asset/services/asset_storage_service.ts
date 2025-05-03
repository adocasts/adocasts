import env from '#start/env'
import {
  Bucket,
  DeleteFileOptions,
  DownloadOptions,
  SaveOptions,
  Storage,
} from '@google-cloud/storage'
import sharp, { AvailableFormatInfo, FormatEnum } from 'sharp'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import fs from 'node:fs'
import app from '@adonisjs/core/services/app'
import logger from '#core/services/logger_service'
import { ImageOptions } from './asset_service.js'

class AssetStorageService {
  private bucket: Bucket

  constructor() {
    const storage = new Storage({ keyFilename: env.get('GCS_KEY_FILENAME') })
    this.bucket = storage.bucket(env.get('GCS_BUCKET'))
  }

  async exists(filename: string) {
    const exists = await this.bucket.file(filename).exists()
    return exists.at(0)
  }

  get(filename: string) {
    return this.bucket.file(filename).createReadStream()
  }

  async url(filename: string) {
    return this.bucket.file(filename).publicUrl()
  }

  async download(filename: string, options?: DownloadOptions) {
    return this.bucket.file(filename).download(options)
  }

  async store(filename: string, data: Buffer, options?: SaveOptions) {
    if (app.inTest) return
    const file = this.bucket.file(filename)
    await file.save(data, options)
  }

  async storeFromTmp(location: string, filename: string, file: MultipartFile) {
    return new Promise<void>((resolve, reject) => {
      try {
        fs.readFile(file.tmpPath!, async (error, data) => {
          if (error) {
            reject(error)
          }

          await this.store(location + filename, data)

          file.markAsMoved('/img/' + filename, location)

          resolve()
        })
      } catch (error) {
        console.log({ error })
        logger.error('StorageService.storeFromTmp', error)
      }
    })
  }

  async destroy(filename: string, options: DeleteFileOptions = { ignoreNotFound: true }) {
    if (app.inTest) return
    return this.bucket.file(filename).delete(options)
  }

  alter(options: ImageOptions) {
    if (app.inTest) return
    if (options.format === 'svg+xml') return

    const writeStream = this.bucket
      .file(options.tempPath)
      .createWriteStream({ contentType: `image/${options.format}` })

    const pipeline = sharp()
    const toOptions = options.quality ? { quality: options.quality } : {}

    if (options.width) {
      pipeline.resize(options.width)
    }

    if (options.format) {
      pipeline.toFormat(options.format as keyof FormatEnum | AvailableFormatInfo, toOptions)
    }

    if (options.blur) {
      pipeline.blur(options.blur)
    }

    pipeline.pipe(writeStream)

    this.bucket.file(options.path).createReadStream().pipe(pipeline)

    return new Promise((resolve, reject) => writeStream.on('finish', resolve).on('error', reject))
  }
}

const assetStorage = new AssetStorageService()
export default assetStorage
