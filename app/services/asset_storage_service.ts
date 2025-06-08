import { MultipartFile } from '@adonisjs/core/bodyparser'
import app from '@adonisjs/core/services/app'
import drive from '@adonisjs/drive/services/main'
import { DeleteFileOptions } from '@google-cloud/storage'
import fs from 'node:fs'
import sharp, { AvailableFormatInfo, FormatEnum } from 'sharp'
import { ImageOptions } from './asset_service.js'
import logger from './logger_service.js'

class AssetStorageService {
  // private bucket: Bucket

  constructor() {
    // const storage = new Storage({ keyFilename: env.get('GCS_KEY_FILENAME') })
    // this.bucket = storage.bucket(env.get('GCS_BUCKET'))
  }

  async exists(filename: string) {
    return drive.use('r2').exists(filename)
    // const exists = await this.bucket.file(filename).exists()
    // return exists.at(0)
  }

  get(filename: string) {
    console.log({ filename })
    return drive.use('r2').getStream(filename)
    // return this.bucket.file(filename).createReadStream()
  }

  async store(filename: string, data: Buffer) {
    if (app.inTest) return
    await drive.use('r2').put(filename, data)
    // const file = this.bucket.file(filename)
    // await file.save(data, options)
  }

  async storeFromTmp(location: string, filename: string, file: MultipartFile) {
    await file.moveToDisk(filename, 'r2')
    return new Promise<void>((resolve, reject) => {
      try {
        fs.readFile(file.tmpPath!, async (error, data) => {
          if (error) {
            reject(error)
          }

          await drive.use('r2').put(location + filename, data)
          // await this.store(location + filename, data)

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
    await drive.use('r2').delete(filename)
    // return this.bucket.file(filename).delete(options)
  }

  async alter(options: ImageOptions) {
    if (app.inTest) return
    if (options.format === 'svg+xml') return

    const file = await drive.use('r2').getBytes(options.path)
    const image = sharp(file)
    const imageAltered = await image.metadata().then((metadata) => {
      const toOptions = options.quality ? { quality: options.quality } : {}
      return image
        .resize(options.width || metadata.width)
        .toFormat(options.format as keyof FormatEnum | AvailableFormatInfo, toOptions)
        .toBuffer()
    })

    return drive.use('r2').put(options.tempPath, imageAltered)
  }
}

const assetStorage = new AssetStorageService()
export default assetStorage
